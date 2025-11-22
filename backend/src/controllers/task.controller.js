import db from "../models/index.js";
import { asyncHandler } from "../utils/jwt.util.js";
import { Op } from "sequelize";

const getAllTask = asyncHandler(async (req, res) => {
  const userId = req.user.id;

  let { page, limit, status, keyword, sort_by, order, start_date, end_date } =
    req.query;
  page = parseInt(page) || 1;
  limit = parseInt(limit) || 5;
  const offset = (page - 1) * limit;

  const whereFilter = { user_id: userId };

  if (status && ["pending", "inprogress", "completed"].includes(status))
    whereFilter.status = status;

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

  const sortColumn = ["title", "created_at", "due_date"].includes(sort_by)
    ? sort_by
    : "created_at";

  const sortOrder = ["ASC", "DESC"].includes(order?.toUpperCase())
    ? order.toUpperCase()
    : "DESC";

  const { rows: tasks, count: total } = await db.Task.findAndCountAll({
    where: whereFilter,
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
  const task = await db.Task.findOne({ where: { id: id, user_id: userId } });

  if (!task) {
    return res.status(404).json({ message: "Task không tồn tại" });
  }
  return res.status(200).json({ message: "Lấy task thành công", task });
});

const createTask = asyncHandler(async (req, res) => {
  const userId = req.user.id;

  const { title, description, status, due_date } = req.body;

  const task = await db.Task.create({
    user_id: userId,
    title,
    description,
    status,
    due_date,
  });

  return res.status(201).json({ message: "Tạo task thành công", task });
});

const updateTask = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const userId = req.user.id;
  const { title, description, status, due_date } = req.body;

  const task = await db.Task.findOne({ where: { id: id, user_id: userId } });
  if (!task) return res.status(404).json({ message: "Task không tồn tại" });

  task.title = title ?? task.title;
  task.description = description ?? task.description;
  task.status = status ?? task.status;
  task.due_date = due_date ?? task.due_date;

  await task.save();

  return res.status(200).json({ message: "Cập nhật task thành công", task });
});

const deleteTask = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const userId = req.user.id;

  const task = await db.Task.findOne({ where: { id: id, user_id: userId } });
  if (!task) {
    return res.status(404).json({ message: "Task không tồn tại" });
  }

  await task.destroy();

  return res.status(200).json({ message: "Xóa task thành công" });
});

const getTaskStats = asyncHandler(async (req, res) => {
  const userId = req.user.id;

  const [pending, inprogress, completed] = await Promise.all([
    db.Task.count({ where: { user_id: userId, status: "pending" } }),
    db.Task.count({ where: { user_id: userId, status: "inprogress" } }),
    db.Task.count({ where: { user_id: userId, status: "completed" } }),
  ]);

  return res.status(200).json({
    message: "Thống kê thành công",
    stats: {
      pending,
      inprogress,
      completed,
      total: pending + inprogress + completed,
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
