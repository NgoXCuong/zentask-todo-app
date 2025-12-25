import db from "../models/index.js";
import { asyncHandler } from "../utils/jwt.util.js";

const getAttachmentsByTask = asyncHandler(async (req, res) => {
  const { taskId } = req.params;
  const userId = req.user.id;

  // Check if user has access to the task
  const task = await db.Task.findByPk(taskId);
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

  const attachments = await db.Attachment.findAll({
    where: { task_id: taskId },
    include: [
      {
        model: db.User,
        attributes: ["id", "full_name", "email", "avatar_url"],
      },
    ],
    order: [["created_at", "DESC"]],
  });

  return res.status(200).json({
    message: "Lấy danh sách file đính kèm thành công",
    data: attachments,
  });
});

const uploadAttachment = asyncHandler(async (req, res) => {
  const { taskId } = req.params;
  const userId = req.user.id;
  const { file_name, file_path, file_type, file_size } = req.body;

  // Check if user has access to the task
  const task = await db.Task.findByPk(taskId);
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
      .json({ message: "Bạn không có quyền upload file cho task này" });
  }

  const attachment = await db.Attachment.create({
    task_id: taskId,
    user_id: userId,
    file_name,
    file_path,
    file_type,
    file_size,
  });

  const attachmentWithUser = await db.Attachment.findByPk(attachment.id, {
    include: [
      {
        model: db.User,
        attributes: ["id", "full_name", "email", "avatar_url"],
      },
    ],
  });

  return res.status(201).json({
    message: "Upload file thành công",
    data: attachmentWithUser,
  });
});

const deleteAttachment = asyncHandler(async (req, res) => {
  const { taskId, attachmentId } = req.params;
  const userId = req.user.id;

  const attachment = await db.Attachment.findOne({
    where: { id: attachmentId, task_id: taskId },
  });

  if (!attachment) {
    return res.status(404).json({ message: "File đính kèm không tồn tại" });
  }

  // Only the uploader or task creator can delete
  const task = await db.Task.findByPk(taskId);
  if (attachment.user_id !== userId && task.creator_id !== userId) {
    return res.status(403).json({ message: "Bạn không có quyền xóa file này" });
  }

  await attachment.destroy();

  return res.status(200).json({ message: "Xóa file đính kèm thành công" });
});

const getAttachmentById = asyncHandler(async (req, res) => {
  const { taskId, attachmentId } = req.params;
  const userId = req.user.id;

  // Check task access first
  const task = await db.Task.findByPk(taskId);
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

  const attachment = await db.Attachment.findOne({
    where: { id: attachmentId, task_id: taskId },
    include: [
      {
        model: db.User,
        attributes: ["id", "full_name", "email", "avatar_url"],
      },
    ],
  });

  if (!attachment) {
    return res.status(404).json({ message: "File đính kèm không tồn tại" });
  }

  return res.status(200).json({
    message: "Lấy thông tin file đính kèm thành công",
    data: attachment,
  });
});

export default {
  getAttachmentsByTask,
  uploadAttachment,
  deleteAttachment,
  getAttachmentById,
};
