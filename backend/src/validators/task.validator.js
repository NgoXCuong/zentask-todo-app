import { body, param } from "express-validator";

export const validateTaskId = [
  param("id")
    .exists()
    .withMessage("ID không được để trống")
    .isInt()
    .withMessage("ID task không phải là số nguyên")
    .toInt(),
];

export const validateCreateTask = [
  body("title")
    .trim()
    .notEmpty()
    .withMessage("Title không được để trống")
    .isLength({ max: 255 })
    .withMessage("Title quá dài"),

  body("status")
    .optional()
    .isIn(["pending", "inprogress", "completed"])
    .withMessage(
      "Trạng thái không hợp lệ (chỉ nhận: pending, inprogress, completed)"
    ),

  body("due_date")
    .optional()
    .isISO8601()
    .withMessage("Ngày hết hạn phải là định dạng ngày hợp lệ (YYYY-MM-DD)"),
];

export const validateUpdateTask = [
  ...validateTaskId,

  body("title")
    .optional()
    .trim()
    .notEmpty()
    .withMessage("Title không được để trống nếu bạn muốn cập nhật nó"),

  body("status")
    .optional()
    .isIn(["pending", "inprogress", "completed"])
    .withMessage(
      "Trạng thái không hợp lệ (chỉ nhận: pending, inprogress, completed)"
    ),

  body("due_date")
    .optional()
    .isISO8601()
    .withMessage("Ngày hết hạn phải là định dạng ngày hợp lệ (YYYY-MM-DD)"),
];
