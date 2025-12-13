import db from "../models/index.js";
import { asyncHandler } from "../utils/jwt.util.js";
import { Op } from "sequelize";

const getCommentsByTaskId = asyncHandler(async (req, res) => {
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

  const comments = await db.Comment.findAll({
    where: { task_id: taskId },
    include: [
      {
        model: db.User,
        attributes: ["id", "full_name", "email"],
      },
    ],
    order: [["created_at", "ASC"]],
  });

  return res.status(200).json({
    message: "Lấy danh sách comments thành công",
    data: comments,
  });
});

const createComment = asyncHandler(async (req, res) => {
  const { taskId } = req.params;
  const userId = req.user.id;
  const { content } = req.body;

  // Check if user has access to the task
  const task = await db.Task.findOne({
    where: {
      id: taskId,
      [Op.or]: [{ creator_id: userId }, { assignee_id: userId }],
      workspace_id: null,
    },
  });

  if (!task) {
    return res.status(404).json({
      message: "Task không tồn tại hoặc bạn không có quyền thêm comment",
    });
  }

  const comment = await db.Comment.create({
    task_id: taskId,
    user_id: userId,
    content,
  });

  // Fetch the created comment with user info
  const createdComment = await db.Comment.findByPk(comment.id, {
    include: [
      {
        model: db.User,
        attributes: ["id", "full_name", "email"],
      },
    ],
  });

  return res.status(201).json({
    message: "Tạo comment thành công",
    data: createdComment,
  });
});

const updateComment = asyncHandler(async (req, res) => {
  const { taskId, commentId } = req.params;
  const userId = req.user.id;
  const { content } = req.body;

  // Check if user has access to the task
  const task = await db.Task.findOne({
    where: {
      id: taskId,
      [Op.or]: [{ creator_id: userId }, { assignee_id: userId }],
      workspace_id: null,
    },
  });

  if (!task) {
    return res.status(404).json({
      message: "Task không tồn tại hoặc bạn không có quyền chỉnh sửa",
    });
  }

  const comment = await db.Comment.findOne({
    where: {
      id: commentId,
      task_id: taskId,
      user_id: userId, // Only comment author can update
    },
  });

  if (!comment) {
    return res.status(404).json({
      message: "Comment không tồn tại hoặc bạn không có quyền chỉnh sửa",
    });
  }

  comment.content = content;
  comment.updated_at = new Date();

  await comment.save();

  // Fetch updated comment with user info
  const updatedComment = await db.Comment.findByPk(comment.id, {
    include: [
      {
        model: db.User,
        attributes: ["id", "full_name", "email"],
      },
    ],
  });

  return res.status(200).json({
    message: "Cập nhật comment thành công",
    data: updatedComment,
  });
});

const deleteComment = asyncHandler(async (req, res) => {
  const { taskId, commentId } = req.params;
  const userId = req.user.id;

  // Check if user has access to the task
  const task = await db.Task.findOne({
    where: {
      id: taskId,
      [Op.or]: [{ creator_id: userId }, { assignee_id: userId }],
      workspace_id: null,
    },
  });

  if (!task) {
    return res.status(404).json({
      message: "Task không tồn tại hoặc bạn không có quyền xóa",
    });
  }

  const comment = await db.Comment.findOne({
    where: {
      id: commentId,
      task_id: taskId,
      user_id: userId, // Only comment author can delete
    },
  });

  if (!comment) {
    return res.status(404).json({
      message: "Comment không tồn tại hoặc bạn không có quyền xóa",
    });
  }

  await comment.destroy();

  return res.status(200).json({ message: "Xóa comment thành công" });
});

export default {
  getCommentsByTaskId,
  createComment,
  updateComment,
  deleteComment,
};
