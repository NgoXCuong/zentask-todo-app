import db from "../models/index.js";
import { asyncHandler } from "../utils/jwt.util.js";
import { Op } from "sequelize";

const getActivityLogs = asyncHandler(async (req, res) => {
  const userId = req.user.id;
  const { page = 1, limit = 20, workspace_id, task_id, action } = req.query;

  const offset = (page - 1) * limit;
  const whereFilter = {};

  // Build access control
  if (workspace_id) {
    // Check if user is member of the workspace
    const memberCheck = await db.WorkspaceMember.findOne({
      where: { workspace_id: parseInt(workspace_id), user_id: userId },
    });
    const workspace = await db.Workspace.findOne({
      where: { id: parseInt(workspace_id), owner_id: userId },
    });

    if (!memberCheck && !workspace) {
      return res.status(403).json({
        message: "Bạn không có quyền truy cập workspace này",
      });
    }
    whereFilter.workspace_id = parseInt(workspace_id);
  } else if (task_id) {
    // Check task access
    const task = await db.Task.findByPk(parseInt(task_id));
    if (!task) {
      return res.status(404).json({ message: "Task không tồn tại" });
    }

    let hasAccess = false;
    if (task.creator_id === userId || task.assignee_id === userId) {
      hasAccess = true;
    } else if (task.workspace_id) {
      const memberCheck = await db.WorkspaceMember.findOne({
        where: { workspace_id: task.workspace_id, user_id: userId },
      });
      if (memberCheck) hasAccess = true;
    }

    if (!hasAccess) {
      return res
        .status(403)
        .json({ message: "Bạn không có quyền truy cập task này" });
    }
    whereFilter.task_id = parseInt(task_id);
  } else {
    // No specific filter - show logs from workspaces user is member of
    whereFilter[Op.or] = [
      {
        workspace_id: {
          [Op.in]: db.sequelize.literal(`(
            SELECT workspace_id FROM workspace_members WHERE user_id = ${userId}
            UNION
            SELECT id FROM workspaces WHERE owner_id = ${userId}
          )`),
        },
      },
      {
        task_id: {
          [Op.in]: db.sequelize.literal(`(
            SELECT id FROM tasks WHERE creator_id = ${userId} OR assignee_id = ${userId}
            UNION
            SELECT t.id FROM tasks t
            INNER JOIN workspace_members wm ON t.workspace_id = wm.workspace_id
            WHERE wm.user_id = ${userId}
          )`),
        },
      },
    ];
  }

  if (action) {
    whereFilter.action = action;
  }

  const { rows: logs, count: total } = await db.ActivityLog.findAndCountAll({
    where: whereFilter,
    include: [
      {
        model: db.User,
        attributes: ["id", "full_name", "email", "avatar_url"],
      },
      {
        model: db.Workspace,
        attributes: ["id", "name"],
      },
      {
        model: db.Task,
        attributes: ["id", "title"],
      },
    ],
    order: [["created_at", "DESC"]],
    limit: parseInt(limit),
    offset,
  });

  const totalPages = Math.ceil(total / limit);

  return res.status(200).json({
    message: "Lấy lịch sử hoạt động thành công",
    meta: { page: parseInt(page), limit: parseInt(limit), total, totalPages },
    data: logs,
  });
});

const createActivityLog = asyncHandler(async (req, res) => {
  const {
    workspace_id,
    task_id,
    action,
    entity_name,
    old_value,
    new_value,
    description,
  } = req.body;
  const userId = req.user.id;

  // Validate access if workspace_id or task_id is provided
  if (workspace_id) {
    const memberCheck = await db.WorkspaceMember.findOne({
      where: { workspace_id: parseInt(workspace_id), user_id: userId },
    });
    const workspace = await db.Workspace.findOne({
      where: { id: parseInt(workspace_id), owner_id: userId },
    });

    if (!memberCheck && !workspace) {
      return res.status(403).json({
        message: "Bạn không có quyền tạo log cho workspace này",
      });
    }
  }

  if (task_id) {
    const task = await db.Task.findByPk(parseInt(task_id));
    if (!task) {
      return res.status(404).json({ message: "Task không tồn tại" });
    }

    let hasAccess = false;
    if (task.creator_id === userId || task.assignee_id === userId) {
      hasAccess = true;
    } else if (task.workspace_id) {
      const memberCheck = await db.WorkspaceMember.findOne({
        where: { workspace_id: task.workspace_id, user_id: userId },
      });
      if (memberCheck) hasAccess = true;
    }

    if (!hasAccess) {
      return res
        .status(403)
        .json({ message: "Bạn không có quyền tạo log cho task này" });
    }
  }

  const log = await db.ActivityLog.create({
    workspace_id: workspace_id || null,
    task_id: task_id || null,
    user_id: userId,
    action,
    entity_name,
    old_value,
    new_value,
    description,
  });

  const logWithDetails = await db.ActivityLog.findByPk(log.id, {
    include: [
      {
        model: db.User,
        attributes: ["id", "full_name", "email", "avatar_url"],
      },
      {
        model: db.Workspace,
        attributes: ["id", "name"],
      },
      {
        model: db.Task,
        attributes: ["id", "title"],
      },
    ],
  });

  return res.status(201).json({
    message: "Tạo log hoạt động thành công",
    data: logWithDetails,
  });
});

const getActivityStats = asyncHandler(async (req, res) => {
  const userId = req.user.id;
  const { workspace_id, task_id } = req.query;

  let baseWhere = {};

  if (workspace_id) {
    const memberCheck = await db.WorkspaceMember.findOne({
      where: { workspace_id: parseInt(workspace_id), user_id: userId },
    });
    const workspace = await db.Workspace.findOne({
      where: { id: parseInt(workspace_id), owner_id: userId },
    });

    if (!memberCheck && !workspace) {
      return res.status(403).json({
        message: "Bạn không có quyền truy cập workspace này",
      });
    }
    baseWhere.workspace_id = parseInt(workspace_id);
  } else if (task_id) {
    const task = await db.Task.findByPk(parseInt(task_id));
    if (!task) {
      return res.status(404).json({ message: "Task không tồn tại" });
    }

    let hasAccess = false;
    if (task.creator_id === userId || task.assignee_id === userId) {
      hasAccess = true;
    } else if (task.workspace_id) {
      const memberCheck = await db.WorkspaceMember.findOne({
        where: { workspace_id: task.workspace_id, user_id: userId },
      });
      if (memberCheck) hasAccess = true;
    }

    if (!hasAccess) {
      return res
        .status(403)
        .json({ message: "Bạn không có quyền truy cập task này" });
    }
    baseWhere.task_id = parseInt(task_id);
  } else {
    baseWhere[Op.or] = [
      {
        workspace_id: {
          [Op.in]: db.sequelize.literal(`(
            SELECT workspace_id FROM workspace_members WHERE user_id = ${userId}
            UNION
            SELECT id FROM workspaces WHERE owner_id = ${userId}
          )`),
        },
      },
      {
        task_id: {
          [Op.in]: db.sequelize.literal(`(
            SELECT id FROM tasks WHERE creator_id = ${userId} OR assignee_id = ${userId}
            UNION
            SELECT t.id FROM tasks t
            INNER JOIN workspace_members wm ON t.workspace_id = wm.workspace_id
            WHERE wm.user_id = ${userId}
          )`),
        },
      },
    ];
  }

  // Get activity counts by action type
  const [createTask, updateTask, deleteTask, assignTask, completeTask] =
    await Promise.all([
      db.ActivityLog.count({
        where: { ...baseWhere, action: "CREATE_TASK" },
      }),
      db.ActivityLog.count({
        where: { ...baseWhere, action: "UPDATE_TASK" },
      }),
      db.ActivityLog.count({
        where: { ...baseWhere, action: "DELETE_TASK" },
      }),
      db.ActivityLog.count({
        where: { ...baseWhere, action: "ASSIGN_TASK" },
      }),
      db.ActivityLog.count({
        where: { ...baseWhere, action: "COMPLETE_TASK" },
      }),
    ]);

  return res.status(200).json({
    message: "Thống kê hoạt động thành công",
    stats: {
      create_task: createTask,
      update_task: updateTask,
      delete_task: deleteTask,
      assign_task: assignTask,
      complete_task: completeTask,
      total: createTask + updateTask + deleteTask + assignTask + completeTask,
    },
  });
});

export default {
  getActivityLogs,
  createActivityLog,
  getActivityStats,
};
