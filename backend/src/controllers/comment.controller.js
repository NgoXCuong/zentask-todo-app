import db from "../models/index.js";
import { asyncHandler } from "../utils/jwt.util.js";
import { Op } from "sequelize";

const getCommentsByTaskId = asyncHandler(async (req, res) => {
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
      message: "Bạn không có quyền thêm comment cho task này",
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
      message: "Bạn không có quyền chỉnh sửa comment",
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
      message: "Bạn không có quyền xóa comment",
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
