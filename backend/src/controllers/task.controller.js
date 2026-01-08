import { asyncHandler } from "../utils/jwt.util.js";
import taskService from "../services/task.service.js";

const getAllTask = asyncHandler(async (req, res) => {
  const userId = req.user.id;
  const filters = req.query;

  try {
    const { tasks, meta } = await taskService.getAllTasks(userId, filters);

    return res.status(200).json({
      message: "Lấy danh sách task thành công",
      meta,
      data: tasks,
    });
  } catch (error) {
    const statusCode = error.message.includes("không hợp lệ")
      ? 400
      : error.message.includes("không có quyền")
      ? 403
      : 500;

    return res.status(statusCode).json({
      message: error.message,
    });
  }
});

const getTaskById = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const userId = req.user.id;

  try {
    const task = await taskService.getTaskById(id, userId);

    return res.status(200).json({
      message: "Lấy task thành công",
      data: task,
    });
  } catch (error) {
    return res.status(404).json({
      message: error.message,
    });
  }
});

const createTask = asyncHandler(async (req, res) => {
  const userId = req.user.id;
  const taskData = req.body;

  try {
    const createdTask = await taskService.createTask(userId, taskData);

    return res.status(201).json({
      message: "Tạo task thành công",
      data: createdTask,
    });
  } catch (error) {
    const statusCode = error.message.includes("không có quyền")
      ? 403
      : error.message.includes("phải là thành viên")
      ? 400
      : 500;

    return res.status(statusCode).json({
      message: error.message,
    });
  }
});

const updateTask = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const userId = req.user.id;
  const updateData = req.body;

  try {
    const updatedTask = await taskService.updateTask(id, userId, updateData);

    return res.status(200).json({
      message: "Cập nhật task thành công",
      data: updatedTask,
    });
  } catch (error) {
    const statusCode = error.message.includes("không tồn tại")
      ? 404
      : error.message.includes("không có quyền")
      ? 403
      : error.message.includes("phải là thành viên")
      ? 400
      : 500;

    return res.status(statusCode).json({
      message: error.message,
    });
  }
});

const deleteTask = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const userId = req.user.id;

  try {
    await taskService.deleteTask(id, userId);

    return res.status(200).json({ message: "Xóa task thành công" });
  } catch (error) {
    const statusCode = error.message.includes("không tồn tại")
      ? 404
      : error.message.includes("không có quyền")
      ? 403
      : 500;

    return res.status(statusCode).json({
      message: error.message,
    });
  }
});

const getTaskStats = asyncHandler(async (req, res) => {
  const userId = req.user.id;
  const { workspace_id } = req.query;

  try {
    const stats = await taskService.getTaskStats(userId, workspace_id);

    return res.status(200).json({
      message: "Thống kê thành công",
      stats,
    });
  } catch (error) {
    const statusCode = error.message.includes("không hợp lệ")
      ? 400
      : error.message.includes("không có quyền")
      ? 403
      : 500;

    return res.status(statusCode).json({
      message: error.message,
    });
  }
});

export default {
  getAllTask,
  getTaskById,
  createTask,
  updateTask,
  deleteTask,
  getTaskStats,
};
