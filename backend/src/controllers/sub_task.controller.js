import db from "../models/index.js";
import { asyncHandler } from "../utils/jwt.util.js";
import { Op } from "sequelize";

const getSubTasksByTaskId = asyncHandler(async (req, res) => {
  const { taskId } = req.params;
  const userId = req.user.id;

  // First check if user has access to the task
  const task = await db.Task.findOne({
    where: {
      id: taskId,
      [Op.or]: [{ creator_id: userId }, { assignee_id: userId }],
      workspace_id: null,
    },
  });

  if (!task) {
    return res.status(404).json({
      message: "Task không tồn tại hoặc bạn không có quyền truy cập",
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

  // Check if user has access to the task (only creator can add sub-tasks)
  const task = await db.Task.findOne({
    where: {
      id: taskId,
      creator_id: userId,
      workspace_id: null,
    },
  });

  if (!task) {
    return res.status(404).json({
      message: "Task không tồn tại hoặc bạn không có quyền thêm sub-task",
    });
  }

  const subTask = await db.SubTask.create({
    task_id: taskId,
    title,
    is_done,
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

  // Check if user has access to the task
  const task = await db.Task.findOne({
    where: {
      id: taskId,
      creator_id: userId,
      workspace_id: null,
    },
  });

  if (!task) {
    return res.status(404).json({
      message: "Task không tồn tại hoặc bạn không có quyền chỉnh sửa",
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

  // Check if user has access to the task
  const task = await db.Task.findOne({
    where: {
      id: taskId,
      creator_id: userId,
      workspace_id: null,
    },
  });

  if (!task) {
    return res.status(404).json({
      message: "Task không tồn tại hoặc bạn không có quyền xóa",
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
