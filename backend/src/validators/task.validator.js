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

  body("description")
    .optional()
    .isLength({ max: 1000 })
    .withMessage("Description quá dài"),

  body("status")
    .optional()
    .isIn(["pending", "inprogress", "completed", "review"])
    .withMessage(
      "Trạng thái không hợp lệ (chỉ nhận: pending, inprogress, completed, review)"
    ),

  body("priority")
    .optional()
    .isIn(["low", "medium", "high", "urgent"])
    .withMessage(
      "Độ ưu tiên không hợp lệ (chỉ nhận: low, medium, high, urgent)"
    ),

  body("due_date")
    .optional()
    .isISO8601()
    .withMessage("Ngày hết hạn phải là định dạng ngày hợp lệ"),

  body("start_date")
    .optional()
    .isISO8601()
    .withMessage("Ngày bắt đầu phải là định dạng ngày hợp lệ"),

  body("reminder_at")
    .optional()
    .isISO8601()
    .withMessage("Thời gian nhắc nhở phải là định dạng ngày hợp lệ"),

  body("category_id")
    .optional()
    .isInt()
    .withMessage("Category ID phải là số nguyên"),

  body("assignee_id")
    .optional()
    .isInt()
    .withMessage("Assignee ID phải là số nguyên"),
];

export const validateUpdateTask = [
  ...validateTaskId,

  body("title")
    .optional()
    .trim()
    .notEmpty()
    .withMessage("Title không được để trống nếu bạn muốn cập nhật nó")
    .isLength({ max: 255 })
    .withMessage("Title quá dài"),

  body("description")
    .optional()
    .isLength({ max: 1000 })
    .withMessage("Description quá dài"),

  body("status")
    .optional()
    .isIn(["pending", "inprogress", "completed", "review"])
    .withMessage(
      "Trạng thái không hợp lệ (chỉ nhận: pending, inprogress, completed, review)"
    ),

  body("priority")
    .optional()
    .isIn(["low", "medium", "high", "urgent"])
    .withMessage(
      "Độ ưu tiên không hợp lệ (chỉ nhận: low, medium, high, urgent)"
    ),

  body("due_date")
    .optional()
    .isISO8601()
    .withMessage("Ngày hết hạn phải là định dạng ngày hợp lệ"),

  body("start_date")
    .optional()
    .isISO8601()
    .withMessage("Ngày bắt đầu phải là định dạng ngày hợp lệ"),

  body("reminder_at")
    .optional()
    .isISO8601()
    .withMessage("Thời gian nhắc nhở phải là định dạng ngày hợp lệ"),

  body("category_id")
    .optional()
    .isInt()
    .withMessage("Category ID phải là số nguyên"),

  body("assignee_id")
    .optional()
    .isInt()
    .withMessage("Assignee ID phải là số nguyên"),
];
