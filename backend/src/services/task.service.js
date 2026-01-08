import db from "../models/index.js";
import { Op } from "sequelize";

class TaskService {
  async getAllTasks(userId, filters = {}) {
    const {
      page = 1,
      limit = 5,
      status,
      keyword,
      sort_by,
      order,
      start_date,
      end_date,
      priority,
      workspace_id,
    } = filters;

    const pageNum = parseInt(page, 10) || 1;
    const limitNum = parseInt(limit, 10) || 5;
    const offset = (pageNum - 1) * limitNum;

    // Get user's accessible workspace IDs
    const userWorkspaces = await db.WorkspaceMember.findAll({
      where: { user_id: userId },
      attributes: ["workspace_id"],
    });

    const ownedWorkspaces = await db.Workspace.findAll({
      where: { owner_id: userId },
      attributes: ["id"],
    });

    const workspaceIds = [
      ...userWorkspaces.map((w) => w.workspace_id),
      ...ownedWorkspaces.map((w) => w.id),
    ];

    // Build filter based on workspace context
    let whereFilter = {};

    if (workspace_id && workspace_id !== "personal") {
      // Specific workspace requested - show ALL tasks in this workspace if user is member
      const workspaceIdInt = parseInt(workspace_id);
      if (isNaN(workspaceIdInt)) {
        throw new Error("workspace_id không hợp lệ");
      }

      if (!workspaceIds.includes(workspaceIdInt)) {
        throw new Error("Bạn không có quyền truy cập workspace này");
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
      const orConditions = [
        // Personal tasks
        {
          [Op.and]: [
            { workspace_id: null },
            {
              [Op.or]: [{ creator_id: userId }, { assignee_id: userId }],
            },
          ],
        },
      ];

      // Only add workspace condition if user has workspaces
      if (workspaceIds.length > 0) {
        orConditions.push({
          workspace_id: { [Op.in]: workspaceIds },
        });
      }

      whereFilter = {
        [Op.or]: orConditions,
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
      limit: limitNum,
      offset,
    });

    const totalPages = Math.ceil(total / limitNum);

    return {
      tasks,
      meta: {
        page,
        limit,
        total,
        totalPages,
      },
    };
  }

  async getTaskById(id, userId) {
    // First get the task to check workspace access
    const task = await db.Task.findByPk(id);
    if (!task) {
      throw new Error("Task không tồn tại");
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
      throw new Error("Bạn không có quyền truy cập task này");
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
          include: [
            { model: db.User, attributes: ["id", "full_name", "email"] },
          ],
        },
      ],
    });

    return fullTask;
  }

  async createTask(userId, taskData) {
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
    } = taskData;

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
        throw new Error("Bạn không có quyền tạo task trong workspace này");
      }

      finalWorkspaceId = parseInt(workspace_id);

      // For workspace tasks, assignee must be a workspace member
      if (assignee_id) {
        const assigneeCheck = await db.WorkspaceMember.findOne({
          where: { workspace_id: finalWorkspaceId, user_id: assignee_id },
        });
        if (!assigneeCheck) {
          throw new Error("Assignee phải là thành viên của workspace");
        }
      }
    }

    const taskPayload = {
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

    const task = await db.Task.create(taskPayload);

    // Log activity
    await db.ActivityLog.create({
      workspace_id: finalWorkspaceId,
      task_id: task.id,
      user_id: userId,
      action: "CREATE_TASK",
      entity_name: "Task",
      description: `Tạo task mới: ${title}`,
    });

    // Create notification for assignee if different from creator
    if (assignee_id && assignee_id !== userId) {
      await db.Notification.create({
        recipient_id: assignee_id,
        sender_id: userId,
        type: "task_assigned",
        reference_id: task.id,
        reference_type: "task",
        message: `Bạn đã được giao task: "${title}"`,
        is_read: false,
      });
    }

    // Create notification for workspace members if it's a workspace task
    if (finalWorkspaceId) {
      const workspaceMembers = await db.WorkspaceMember.findAll({
        where: {
          workspace_id: finalWorkspaceId,
          user_id: { [Op.ne]: userId },
        },
        include: [{ model: db.User, attributes: ["id"] }],
      });

      for (const member of workspaceMembers) {
        await db.Notification.create({
          recipient_id: member.user_id,
          sender_id: userId,
          type: "task_created",
          reference_id: task.id,
          reference_type: "task",
          message: `Task mới được tạo trong workspace: "${title}"`,
          is_read: false,
        });
      }
    }

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

    return createdTask;
  }

  async updateTask(id, userId, updateData) {
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
    } = updateData;

    // First get the task to check permissions
    const task = await db.Task.findByPk(id);
    if (!task) {
      throw new Error("Task không tồn tại");
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
      throw new Error("Bạn không có quyền chỉnh sửa task này");
    }

    // For workspace tasks, validate assignee is a member
    if (task.workspace_id && assignee_id && isWorkspaceAdmin) {
      const assigneeCheck = await db.WorkspaceMember.findOne({
        where: { workspace_id: task.workspace_id, user_id: assignee_id },
      });
      if (!assigneeCheck) {
        throw new Error("Assignee phải là thành viên của workspace");
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

    // Track changes for notifications
    const oldAssigneeId = task.assignee_id;
    const oldStatus = task.status;

    // Set completed_at when status changes to completed
    if (status === "completed" && task.status !== "completed") {
      task.completed_at = new Date();
    } else if (status !== "completed") {
      task.completed_at = null;
    }

    await task.save();

    // Log activity
    await db.ActivityLog.create({
      workspace_id: task.workspace_id,
      task_id: task.id,
      user_id: userId,
      action: "UPDATE_TASK",
      entity_name: "Task",
      description: `Cập nhật task: ${task.title}`,
    });

    // Create notifications based on changes
    // Task completed notification
    if (status === "completed" && oldStatus !== "completed") {
      // Notify creator if different from completer
      if (task.creator_id !== userId) {
        await db.Notification.create({
          recipient_id: task.creator_id,
          sender_id: userId,
          type: "task_completed",
          reference_id: task.id,
          reference_type: "task",
          message: `Task "${task.title}" đã được hoàn thành`,
          is_read: false,
        });
      }

      // Notify workspace members for workspace tasks
      if (task.workspace_id) {
        const workspaceMembers = await db.WorkspaceMember.findAll({
          where: {
            workspace_id: task.workspace_id,
            user_id: { [Op.ne]: userId },
          },
        });

        for (const member of workspaceMembers) {
          await db.Notification.create({
            recipient_id: member.user_id,
            sender_id: userId,
            type: "task_completed",
            reference_id: task.id,
            reference_type: "task",
            message: `Task "${task.title}" trong workspace đã được hoàn thành`,
            is_read: false,
          });
        }
      }
    }

    // Task assigned notification (when assignee changes)
    if (
      assignee_id !== undefined &&
      assignee_id !== oldAssigneeId &&
      assignee_id !== userId
    ) {
      await db.Notification.create({
        recipient_id: assignee_id,
        sender_id: userId,
        type: "task_assigned",
        reference_id: task.id,
        reference_type: "task",
        message: `Bạn đã được giao task: "${task.title}"`,
        is_read: false,
      });
    }

    // Task updated notification for workspace members (excluding the updater)
    if (
      task.workspace_id &&
      (title !== undefined ||
        description !== undefined ||
        priority !== undefined ||
        due_date !== undefined)
    ) {
      const workspaceMembers = await db.WorkspaceMember.findAll({
        where: {
          workspace_id: task.workspace_id,
          user_id: { [Op.ne]: userId },
        },
      });

      for (const member of workspaceMembers) {
        await db.Notification.create({
          recipient_id: member.user_id,
          sender_id: userId,
          type: "task_updated",
          reference_id: task.id,
          reference_type: "task",
          message: `Task "${task.title}" đã được cập nhật`,
          is_read: false,
        });
      }
    }

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

    return updatedTask;
  }

  async deleteTask(id, userId) {
    // First get the task to check permissions
    const task = await db.Task.findByPk(id);
    if (!task) {
      throw new Error("Task không tồn tại");
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
      throw new Error("Bạn không có quyền xóa task này");
    }

    // Log activity before deleting
    await db.ActivityLog.create({
      workspace_id: task.workspace_id,
      task_id: task.id,
      user_id: userId,
      action: "DELETE_TASK",
      entity_name: "Task",
      description: `Xóa task: ${task.title}`,
    });

    await task.destroy(); // This will soft delete due to paranoid: true

    return true;
  }

  async getTaskStats(userId, workspace_id) {
    // Get user's accessible workspace IDs
    const userWorkspaces = await db.WorkspaceMember.findAll({
      where: { user_id: userId },
      attributes: ["workspace_id"],
    });

    const ownedWorkspaces = await db.Workspace.findAll({
      where: { owner_id: userId },
      attributes: ["id"],
    });

    const workspaceIds = [
      ...userWorkspaces.map((w) => w.workspace_id),
      ...ownedWorkspaces.map((w) => w.id),
    ];

    // Build filter based on workspace context
    let baseWhere = {};

    if (workspace_id && workspace_id !== "personal") {
      // Specific workspace requested - show ALL tasks in this workspace if user is member
      const workspaceIdInt = parseInt(workspace_id);
      if (isNaN(workspaceIdInt)) {
        throw new Error("workspace_id không hợp lệ");
      }

      if (!workspaceIds.includes(workspaceIdInt)) {
        throw new Error("Bạn không có quyền truy cập workspace này");
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
      const orConditions = [
        // Personal tasks
        {
          [Op.and]: [
            { workspace_id: null },
            {
              [Op.or]: [{ creator_id: userId }, { assignee_id: userId }],
            },
          ],
        },
      ];

      // Only add workspace condition if user has workspaces
      if (workspaceIds.length > 0) {
        orConditions.push({
          workspace_id: { [Op.in]: workspaceIds },
        });
      }

      baseWhere = {
        [Op.or]: orConditions,
      };
    }

    const [pending, inprogress, completed, review, canceled] =
      await Promise.all([
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

    return {
      pending,
      inprogress,
      completed,
      review,
      canceled,
      total: pending + inprogress + completed + review + canceled,
    };
  }
}

export default new TaskService();
