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

  // Log activity
  await db.ActivityLog.create({
    workspace_id: task.workspace_id,
    task_id: taskId,
    user_id: userId,
    action: "ADD_COMMENT",
    entity_name: "Comment",
    description: `Thêm bình luận cho task: ${task.title}`,
  });

  // Create notifications for new comment
  // Notify task creator if different from commenter
  if (task.creator_id !== userId) {
    await db.Notification.create({
      recipient_id: task.creator_id,
      sender_id: userId,
      type: "new_comment",
      reference_id: task.id,
      reference_type: "task",
      message: `Có bình luận mới trong task: "${task.title}"`,
      is_read: false,
    });
  }

  // Notify task assignee if different from commenter and creator
  if (task.assignee_id !== userId && task.assignee_id !== task.creator_id) {
    await db.Notification.create({
      recipient_id: task.assignee_id,
      sender_id: userId,
      type: "new_comment",
      reference_id: task.id,
      reference_type: "task",
      message: `Có bình luận mới trong task: "${task.title}"`,
      is_read: false,
    });
  }

  // Notify workspace members for workspace tasks (excluding commenter)
  if (task.workspace_id) {
    const workspaceMembers = await db.WorkspaceMember.findAll({
      where: {
        workspace_id: task.workspace_id,
        user_id: { [Op.ne]: userId },
      },
    });

    for (const member of workspaceMembers) {
      // Skip if already notified as creator or assignee
      if (
        member.user_id === task.creator_id ||
        member.user_id === task.assignee_id
      ) {
        continue;
      }

      await db.Notification.create({
        recipient_id: member.user_id,
        sender_id: userId,
        type: "new_comment",
        reference_id: task.id,
        reference_type: "task",
        message: `Có bình luận mới trong task "${task.title}" của workspace`,
        is_read: false,
      });
    }
  }

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

  // Create notification for comment update
  // Notify task creator if different from comment author
  if (task.creator_id !== userId) {
    await db.Notification.create({
      recipient_id: task.creator_id,
      sender_id: userId,
      type: "comment_updated",
      reference_id: task.id,
      reference_type: "task",
      message: `Bình luận trong task "${task.title}" đã được chỉnh sửa`,
      is_read: false,
    });
  }

  // Notify task assignee if different from comment author and creator
  if (task.assignee_id !== userId && task.assignee_id !== task.creator_id) {
    await db.Notification.create({
      recipient_id: task.assignee_id,
      sender_id: userId,
      type: "comment_updated",
      reference_id: task.id,
      reference_type: "task",
      message: `Bình luận trong task "${task.title}" đã được chỉnh sửa`,
      is_read: false,
    });
  }

  // Notify workspace members for workspace tasks (excluding comment author)
  if (task.workspace_id) {
    const workspaceMembers = await db.WorkspaceMember.findAll({
      where: {
        workspace_id: task.workspace_id,
        user_id: { [Op.ne]: userId },
      },
    });

    for (const member of workspaceMembers) {
      // Skip if already notified as creator or assignee
      if (
        member.user_id === task.creator_id ||
        member.user_id === task.assignee_id
      ) {
        continue;
      }

      await db.Notification.create({
        recipient_id: member.user_id,
        sender_id: userId,
        type: "comment_updated",
        reference_id: task.id,
        reference_type: "task",
        message: `Bình luận trong task "${task.title}" của workspace đã được chỉnh sửa`,
        is_read: false,
      });
    }
  }

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
