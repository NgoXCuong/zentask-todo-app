import db from "../models/index.js";
import { asyncHandler } from "../utils/jwt.util.js";
import { Op } from "sequelize";

const getUserNotifications = asyncHandler(async (req, res) => {
  const userId = req.user.id;
  const { page = 1, limit = 10, is_read } = req.query;

  const offset = (page - 1) * limit;
  const whereFilter = { recipient_id: userId };

  if (is_read !== undefined) {
    whereFilter.is_read = is_read === "true";
  }

  const { rows: notifications, count: total } =
    await db.Notification.findAndCountAll({
      where: whereFilter,
      include: [
        {
          model: db.User,
          as: "sender",
          attributes: ["id", "full_name", "email", "avatar_url"],
        },
      ],
      order: [["created_at", "DESC"]],
      limit: parseInt(limit),
      offset,
    });

  const totalPages = Math.ceil(total / limit);

  return res.status(200).json({
    message: "Lấy danh sách thông báo thành công",
    meta: { page: parseInt(page), limit: parseInt(limit), total, totalPages },
    data: notifications,
  });
});

const markAsRead = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const userId = req.user.id;

  const notification = await db.Notification.findOne({
    where: { id, recipient_id: userId },
  });

  if (!notification) {
    return res.status(404).json({ message: "Thông báo không tồn tại" });
  }

  notification.is_read = true;
  await notification.save();

  return res.status(200).json({
    message: "Đánh dấu đã đọc thành công",
    data: notification,
  });
});

const markAllAsRead = asyncHandler(async (req, res) => {
  const userId = req.user.id;

  await db.Notification.update(
    { is_read: true },
    { where: { recipient_id: userId, is_read: false } }
  );

  return res.status(200).json({ message: "Đánh dấu tất cả đã đọc thành công" });
});

const getUnreadCount = asyncHandler(async (req, res) => {
  const userId = req.user.id;

  const count = await db.Notification.count({
    where: { recipient_id: userId, is_read: false },
  });

  return res.status(200).json({
    message: "Lấy số thông báo chưa đọc thành công",
    data: { unread_count: count },
  });
});

const createNotification = asyncHandler(async (req, res) => {
  const {
    recipient_id,
    type,
    message,
    reference_id,
    reference_type,
    sender_id,
  } = req.body;

  const notification = await db.Notification.create({
    recipient_id,
    sender_id: sender_id || null,
    type,
    reference_id,
    reference_type,
    message,
  });

  return res.status(201).json({
    message: "Tạo thông báo thành công",
    data: notification,
  });
});

const deleteNotification = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const userId = req.user.id;

  const notification = await db.Notification.findOne({
    where: { id, recipient_id: userId },
  });

  if (!notification) {
    return res.status(404).json({ message: "Thông báo không tồn tại" });
  }

  await notification.destroy();

  return res.status(200).json({ message: "Xóa thông báo thành công" });
});

export default {
  getUserNotifications,
  markAsRead,
  markAllAsRead,
  getUnreadCount,
  createNotification,
  deleteNotification,
};
