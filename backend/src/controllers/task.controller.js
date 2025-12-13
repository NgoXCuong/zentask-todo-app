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
  } = req.query;
  page = parseInt(page) || 1;
  limit = parseInt(limit) || 5;
  const offset = (page - 1) * limit;

  // For personal use, only show tasks where workspace_id is NULL and user is creator or assignee
  const whereFilter = {
    [Op.or]: [{ creator_id: userId }, { assignee_id: userId }],
    workspace_id: null, // Personal tasks only
  };

  if (
    status &&
    ["pending", "inprogress", "completed", "review"].includes(status)
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
  const task = await db.Task.findOne({
    where: {
      id: id,
      [Op.or]: [{ creator_id: userId }, { assignee_id: userId }],
      workspace_id: null, // Personal tasks only
    },
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

  if (!task) {
    return res.status(404).json({ message: "Task không tồn tại" });
  }
  return res.status(200).json({ message: "Lấy task thành công", data: task });
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
  } = req.body;

  // For personal use, workspace_id is null
  // assignee_id can be different from creator_id for personal delegation
  const taskData = {
    creator_id: userId,
    assignee_id: assignee_id || userId, // Default to self if not specified
    workspace_id: null, // Personal task
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

  const task = await db.Task.findOne({
    where: {
      id: id,
      creator_id: userId, // Only creator can update
      workspace_id: null, // Personal tasks only
    },
  });
  if (!task)
    return res.status(404).json({
      message: "Task không tồn tại hoặc bạn không có quyền chỉnh sửa",
    });

  // Update fields if provided
  if (title !== undefined) task.title = title;
  if (description !== undefined) task.description = description;
  if (status !== undefined) task.status = status;
  if (priority !== undefined) task.priority = priority;
  if (due_date !== undefined) task.due_date = due_date;
  if (start_date !== undefined) task.start_date = start_date;
  if (reminder_at !== undefined) task.reminder_at = reminder_at;
  if (category_id !== undefined) task.category_id = category_id;
  if (assignee_id !== undefined) task.assignee_id = assignee_id;

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

  const task = await db.Task.findOne({
    where: {
      id: id,
      creator_id: userId, // Only creator can delete
      workspace_id: null, // Personal tasks only
    },
  });
  if (!task) {
    return res
      .status(404)
      .json({ message: "Task không tồn tại hoặc bạn không có quyền xóa" });
  }

  await task.destroy(); // This will soft delete due to paranoid: true

  return res.status(200).json({ message: "Xóa task thành công" });
});

const getTaskStats = asyncHandler(async (req, res) => {
  const userId = req.user.id;

  const [pending, inprogress, completed, review] = await Promise.all([
    db.Task.count({
      where: {
        [Op.or]: [{ creator_id: userId }, { assignee_id: userId }],
        workspace_id: null,
        status: "pending",
      },
    }),
    db.Task.count({
      where: {
        [Op.or]: [{ creator_id: userId }, { assignee_id: userId }],
        workspace_id: null,
        status: "inprogress",
      },
    }),
    db.Task.count({
      where: {
        [Op.or]: [{ creator_id: userId }, { assignee_id: userId }],
        workspace_id: null,
        status: "completed",
      },
    }),
    db.Task.count({
      where: {
        [Op.or]: [{ creator_id: userId }, { assignee_id: userId }],
        workspace_id: null,
        status: "review",
      },
    }),
  ]);

  return res.status(200).json({
    message: "Thống kê thành công",
    stats: {
      pending,
      inprogress,
      completed,
      review,
      total: pending + inprogress + completed + review,
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
