import db from "../models/index.js";
import { asyncHandler } from "../utils/jwt.util.js";
import { Op } from "sequelize";

const getSubTasksByTaskId = asyncHandler(async (req, res) => {
  const { taskId } = req.params;
  const userId = req.user.id;

  // First get the task to check access
  const task = await db.Task.findByPk(taskId);
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

  const subTasks = await db.SubTask.findAll({
    where: { task_id: taskId },
    order: [["created_at", "ASC"]],
  });

  return res.status(200).json({
    message: "Lấy danh sách sub-tasks thành công",
    data: subTasks,
  });
});

const createSubTask = asyncHandler(async (req, res) => {
  const { taskId } = req.params;
  const userId = req.user.id;
  const { title, is_done = false } = req.body;

  // First get the task to check permissions
  const task = await db.Task.findByPk(taskId);
  if (!task) {
    return res.status(404).json({ message: "Task không tồn tại" });
  }

  // Check permissions (only creator or workspace admin can add sub-tasks)
  let canCreate = false;

  if (task.creator_id === userId) {
    canCreate = true;
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
      canCreate = true;
    }
  }

  if (!canCreate) {
    return res.status(403).json({
      message: "Bạn không có quyền thêm sub-task cho task này",
    });
  }

  const subTask = await db.SubTask.create({
    task_id: taskId,
    title,
    is_done,
  });

  // Log activity
  await db.ActivityLog.create({
    workspace_id: task.workspace_id,
    task_id: taskId,
    user_id: userId,
    action: "CREATE_SUBTASK",
    entity_name: "SubTask",
    description: `Thêm nhiệm vụ con cho task: ${task.title}`,
  });

  return res.status(201).json({
    message: "Tạo sub-task thành công",
    data: subTask,
  });
});

const updateSubTask = asyncHandler(async (req, res) => {
  const { taskId, subTaskId } = req.params;
  const userId = req.user.id;
  const { title, is_done } = req.body;

  // First get the task to check permissions
  const task = await db.Task.findByPk(taskId);
  if (!task) {
    return res.status(404).json({ message: "Task không tồn tại" });
  }

  // Check permissions (creator or workspace admin)
  let canUpdate = false;

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
    }
  }

  if (!canUpdate) {
    return res.status(403).json({
      message: "Bạn không có quyền chỉnh sửa sub-task này",
    });
  }

  const subTask = await db.SubTask.findOne({
    where: {
      id: subTaskId,
      task_id: taskId,
    },
  });

  if (!subTask) {
    return res.status(404).json({ message: "Sub-task không tồn tại" });
  }

  subTask.title = title ?? subTask.title;
  subTask.is_done = is_done ?? subTask.is_done;

  await subTask.save();

  return res.status(200).json({
    message: "Cập nhật sub-task thành công",
    data: subTask,
  });
});

const deleteSubTask = asyncHandler(async (req, res) => {
  const { taskId, subTaskId } = req.params;
  const userId = req.user.id;

  // First get the task to check permissions
  const task = await db.Task.findByPk(taskId);
  if (!task) {
    return res.status(404).json({ message: "Task không tồn tại" });
  }

  // Check permissions (creator or workspace admin)
  let canDelete = false;

  if (task.creator_id === userId) {
    canDelete = true;
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
      canDelete = true;
    }
  }

  if (!canDelete) {
    return res.status(403).json({
      message: "Bạn không có quyền xóa sub-task này",
    });
  }

  const subTask = await db.SubTask.findOne({
    where: {
      id: subTaskId,
      task_id: taskId,
    },
  });

  if (!subTask) {
    return res.status(404).json({ message: "Sub-task không tồn tại" });
  }

  await subTask.destroy();

  return res.status(200).json({ message: "Xóa sub-task thành công" });
});

export default {
  getSubTasksByTaskId,
  createSubTask,
  updateSubTask,
  deleteSubTask,
};
