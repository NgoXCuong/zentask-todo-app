import db from "../models/index.js";
import { asyncHandler } from "../utils/jwt.util.js";
import { Op } from "sequelize";

const getAllTask = asyncHandler(async (req, res) => {
  const userId = req.user.id;

  let {
    page,
    limit,
    status,
    keyword,
    sort_by,
    order,
    start_date,
    end_date,
    priority,
    workspace_id,
  } = req.query;
  page = parseInt(page) || 1;
  limit = parseInt(limit) || 5;
  const offset = (page - 1) * limit;

  // Build filter based on workspace context
  let whereFilter = {};

  if (workspace_id && workspace_id !== "personal") {
    // Specific workspace requested - show ALL tasks in this workspace if user is member
    const workspaceIdInt = parseInt(workspace_id);
    if (isNaN(workspaceIdInt)) {
      return res.status(400).json({
        message: "workspace_id không hợp lệ",
      });
    }

    // Check if user is member of the workspace
    const memberCheck = await db.WorkspaceMember.findOne({
      where: { workspace_id: workspaceIdInt, user_id: userId },
    });

    const workspace = await db.Workspace.findOne({
      where: { id: workspaceIdInt, owner_id: userId },
    });

    if (!memberCheck && !workspace) {
      return res.status(403).json({
        message: "Bạn không có quyền truy cập workspace này",
      });
    }

    // For workspace tasks, show ALL tasks in the workspace
    whereFilter.workspace_id = workspaceIdInt;
  } else if (workspace_id === "personal") {
    // Personal tasks only - show only tasks user created or is assigned to
    whereFilter = {
      [Op.and]: [
        { workspace_id: null },
        {
          [Op.or]: [{ creator_id: userId }, { assignee_id: userId }],
        },
      ],
    };
  } else {
    // No workspace filter - show all accessible tasks
    // Personal tasks that user created or is assigned to, plus all tasks from workspaces user is member of
    whereFilter = {
      [Op.or]: [
        // Personal tasks
        {
          [Op.and]: [
            { workspace_id: null },
            {
              [Op.or]: [{ creator_id: userId }, { assignee_id: userId }],
            },
          ],
        },
        // Workspace tasks where user is a member
        {
          workspace_id: {
            [Op.in]: db.sequelize.literal(`(
              SELECT workspace_id FROM workspace_members WHERE user_id = ${userId}
              UNION
              SELECT id FROM workspaces WHERE owner_id = ${userId}
            )`),
          },
        },
      ],
    };
  }

  if (
    status &&
    ["pending", "inprogress", "completed", "review", "canceled"].includes(
      status
    )
  )
    whereFilter.status = status;

  if (priority && ["low", "medium", "high", "urgent"].includes(priority))
    whereFilter.priority = priority;

  if (keyword) whereFilter.title = { [Op.like]: `%${keyword}%` };

  if (start_date || end_date) {
    whereFilter.due_date = {};
    if (start_date) whereFilter.due_date[Op.gte] = new Date(start_date);
    if (end_date) {
      const end = new Date(end_date);
      end.setHours(23, 59, 59, 999);
      whereFilter.due_date[Op.lte] = end;
    }
  }

  const sortColumn = ["title", "created_at", "due_date", "priority"].includes(
    sort_by
  )
    ? sort_by
    : "created_at";

  const sortOrder = ["ASC", "DESC"].includes(order?.toUpperCase())
    ? order.toUpperCase()
    : "DESC";

  const { rows: tasks, count: total } = await db.Task.findAndCountAll({
    where: whereFilter,
    include: [
      {
        model: db.User,
        as: "creator",
        attributes: ["id", "full_name", "email"],
      },
      {
        model: db.User,
        as: "assignee",
        attributes: ["id", "full_name", "email"],
      },
      { model: db.Category, attributes: ["id", "name", "color"] },
      { model: db.SubTask, attributes: ["id", "title", "is_done"] },
    ],
    order: [[sortColumn, sortOrder]],
    limit,
    offset,
  });

  const totalPages = Math.ceil(total / limit);

  return res.status(200).json({
    message: "Lấy danh sách task thành công",
    meta: {
      page,
      limit,
      total,
      totalPages,
    },
    data: tasks,
  });
});

const getTaskById = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const userId = req.user.id;

  // First get the task to check workspace access
  const task = await db.Task.findByPk(id);
  if (!task) {
    return res.status(404).json({ message: "Task không tồn tại" });
  }

  // Check access permissions
  let hasAccess = false;

  if (task.creator_id === userId || task.assignee_id === userId) {
    hasAccess = true;
  } else if (task.workspace_id) {
    // Check workspace membership
    const memberCheck = await db.WorkspaceMember.findOne({
      where: { workspace_id: task.workspace_id, user_id: userId },
    });
    if (memberCheck) {
      hasAccess = true;
    }
  }

  if (!hasAccess) {
    return res.status(403).json({
      message: "Bạn không có quyền truy cập task này",
    });
  }

  // Fetch full task with associations
  const fullTask = await db.Task.findByPk(id, {
    include: [
      {
        model: db.User,
        as: "creator",
        attributes: ["id", "full_name", "email"],
      },
      {
        model: db.User,
        as: "assignee",
        attributes: ["id", "full_name", "email"],
      },
      { model: db.Category, attributes: ["id", "name", "color"] },
      {
        model: db.SubTask,
        attributes: ["id", "title", "is_done", "created_at"],
      },
      {
        model: db.Comment,
        include: [{ model: db.User, attributes: ["id", "full_name", "email"] }],
      },
    ],
  });

  return res
    .status(200)
    .json({ message: "Lấy task thành công", data: fullTask });
});

const createTask = asyncHandler(async (req, res) => {
  const userId = req.user.id;

  const {
    title,
    description,
    status = "pending",
    priority = "medium",
    due_date,
    start_date,
    reminder_at,
    category_id,
    assignee_id,
    workspace_id,
  } = req.body;

  let finalWorkspaceId = null;

  // If workspace_id is provided, validate workspace access
  if (workspace_id) {
    const memberCheck = await db.WorkspaceMember.findOne({
      where: { workspace_id: parseInt(workspace_id), user_id: userId },
    });

    const workspace = await db.Workspace.findOne({
      where: { id: parseInt(workspace_id), owner_id: userId },
    });

    if (!memberCheck && !workspace) {
      return res.status(403).json({
        message: "Bạn không có quyền tạo task trong workspace này",
      });
    }

    finalWorkspaceId = parseInt(workspace_id);

    // For workspace tasks, assignee must be a workspace member
    if (assignee_id) {
      const assigneeCheck = await db.WorkspaceMember.findOne({
        where: { workspace_id: finalWorkspaceId, user_id: assignee_id },
      });
      if (!assigneeCheck) {
        return res.status(400).json({
          message: "Assignee phải là thành viên của workspace",
        });
      }
    }
  }

  const taskData = {
    creator_id: userId,
    assignee_id: assignee_id || userId, // Default to self if not specified
    workspace_id: finalWorkspaceId,
    title,
    description,
    status,
    priority,
    due_date,
    start_date,
    reminder_at,
    category_id: category_id || null,
  };

  const task = await db.Task.create(taskData);

  // Fetch the created task with associations
  const createdTask = await db.Task.findByPk(task.id, {
    include: [
      {
        model: db.User,
        as: "creator",
        attributes: ["id", "full_name", "email"],
      },
      {
        model: db.User,
        as: "assignee",
        attributes: ["id", "full_name", "email"],
      },
      { model: db.Category, attributes: ["id", "name", "color"] },
    ],
  });

  return res
    .status(201)
    .json({ message: "Tạo task thành công", data: createdTask });
});

const updateTask = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const userId = req.user.id;
  const {
    title,
    description,
    status,
    priority,
    due_date,
    start_date,
    reminder_at,
    category_id,
    assignee_id,
  } = req.body;

  // First get the task to check permissions
  const task = await db.Task.findByPk(id);
  if (!task) {
    return res.status(404).json({ message: "Task không tồn tại" });
  }

  // Check update permissions
  let canUpdate = false;
  let isWorkspaceAdmin = false;

  if (task.creator_id === userId) {
    canUpdate = true;
  } else if (task.workspace_id) {
    // Check if user is admin/owner in workspace
    const memberCheck = await db.WorkspaceMember.findOne({
      where: {
        workspace_id: task.workspace_id,
        user_id: userId,
        role: { [Op.in]: ["owner", "admin"] },
      },
    });

    const workspace = await db.Workspace.findOne({
      where: { id: task.workspace_id, owner_id: userId },
    });

    if (memberCheck || workspace) {
      canUpdate = true;
      isWorkspaceAdmin = true;
    }
  }

  if (!canUpdate) {
    return res.status(403).json({
      message: "Bạn không có quyền chỉnh sửa task này",
    });
  }

  // For workspace tasks, validate assignee is a member
  if (task.workspace_id && assignee_id && isWorkspaceAdmin) {
    const assigneeCheck = await db.WorkspaceMember.findOne({
      where: { workspace_id: task.workspace_id, user_id: assignee_id },
    });
    if (!assigneeCheck) {
      return res.status(400).json({
        message: "Assignee phải là thành viên của workspace",
      });
    }
  }

  // Update fields if provided
  if (title !== undefined) task.title = title;
  if (description !== undefined) task.description = description;
  if (status !== undefined) task.status = status;
  if (priority !== undefined) task.priority = priority;
  if (due_date !== undefined) task.due_date = due_date;
  if (start_date !== undefined) task.start_date = start_date;
  if (reminder_at !== undefined) task.reminder_at = reminder_at;
  if (category_id !== undefined) task.category_id = category_id;
  if (
    assignee_id !== undefined &&
    (task.creator_id === userId || isWorkspaceAdmin)
  ) {
    task.assignee_id = assignee_id;
  }

  // Set completed_at when status changes to completed
  if (status === "completed" && task.status !== "completed") {
    task.completed_at = new Date();
  } else if (status !== "completed") {
    task.completed_at = null;
  }

  await task.save();

  // Fetch updated task with associations
  const updatedTask = await db.Task.findByPk(task.id, {
    include: [
      {
        model: db.User,
        as: "creator",
        attributes: ["id", "full_name", "email"],
      },
      {
        model: db.User,
        as: "assignee",
        attributes: ["id", "full_name", "email"],
      },
      { model: db.Category, attributes: ["id", "name", "color"] },
    ],
  });

  return res
    .status(200)
    .json({ message: "Cập nhật task thành công", data: updatedTask });
});

const deleteTask = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const userId = req.user.id;

  // First get the task to check permissions
  const task = await db.Task.findByPk(id);
  if (!task) {
    return res.status(404).json({ message: "Task không tồn tại" });
  }

  // Check delete permissions
  let canDelete = false;

  if (task.creator_id === userId) {
    canDelete = true;
  } else if (task.workspace_id) {
    // Check if user is owner/admin in workspace
    const memberCheck = await db.WorkspaceMember.findOne({
      where: {
        workspace_id: task.workspace_id,
        user_id: userId,
        role: { [Op.in]: ["owner", "admin"] },
      },
    });

    const workspace = await db.Workspace.findOne({
      where: { id: task.workspace_id, owner_id: userId },
    });

    if (memberCheck || workspace) {
      canDelete = true;
    }
  }

  if (!canDelete) {
    return res.status(403).json({
      message: "Bạn không có quyền xóa task này",
    });
  }

  await task.destroy(); // This will soft delete due to paranoid: true

  return res.status(200).json({ message: "Xóa task thành công" });
});

const getTaskStats = asyncHandler(async (req, res) => {
  const userId = req.user.id;
  const { workspace_id } = req.query;

  // Build filter based on workspace context
  let baseWhere = {};

  if (workspace_id && workspace_id !== "personal") {
    // Specific workspace requested - show ALL tasks in this workspace if user is member
    const workspaceIdInt = parseInt(workspace_id);
    if (isNaN(workspaceIdInt)) {
      return res.status(400).json({
        message: "workspace_id không hợp lệ",
      });
    }

    // Check if user is member of the workspace
    const memberCheck = await db.WorkspaceMember.findOne({
      where: { workspace_id: workspaceIdInt, user_id: userId },
    });

    const workspace = await db.Workspace.findOne({
      where: { id: workspaceIdInt, owner_id: userId },
    });

    if (!memberCheck && !workspace) {
      return res.status(403).json({
        message: "Bạn không có quyền truy cập workspace này",
      });
    }

    // For workspace tasks, show ALL tasks in the workspace
    baseWhere.workspace_id = workspaceIdInt;
  } else if (workspace_id === "personal") {
    // Personal tasks only - show only tasks user created or is assigned to
    baseWhere = {
      [Op.and]: [
        { workspace_id: null },
        {
          [Op.or]: [{ creator_id: userId }, { assignee_id: userId }],
        },
      ],
    };
  } else {
    // No workspace filter - show all accessible tasks
    // Personal tasks that user created or is assigned to, plus all tasks from workspaces user is member of
    baseWhere = {
      [Op.or]: [
        // Personal tasks
        {
          [Op.and]: [
            { workspace_id: null },
            {
              [Op.or]: [{ creator_id: userId }, { assignee_id: userId }],
            },
          ],
        },
        // Workspace tasks where user is a member
        {
          workspace_id: {
            [Op.in]: db.sequelize.literal(`(
              SELECT workspace_id FROM workspace_members WHERE user_id = ${userId}
              UNION
              SELECT id FROM workspaces WHERE owner_id = ${userId}
            )`),
          },
        },
      ],
    };
  }

  const [pending, inprogress, completed, review, canceled] = await Promise.all([
    db.Task.count({
      where: { ...baseWhere, status: "pending" },
    }),
    db.Task.count({
      where: { ...baseWhere, status: "inprogress" },
    }),
    db.Task.count({
      where: { ...baseWhere, status: "completed" },
    }),
    db.Task.count({
      where: { ...baseWhere, status: "review" },
    }),
    db.Task.count({
      where: { ...baseWhere, status: "canceled" },
    }),
  ]);

  return res.status(200).json({
    message: "Thống kê thành công",
    stats: {
      pending,
      inprogress,
      completed,
      review,
      canceled,
      total: pending + inprogress + completed + review + canceled,
    },
  });
});

export default {
  getAllTask,
  getTaskById,
  createTask,
  updateTask,
  deleteTask,
  getTaskStats,
};
