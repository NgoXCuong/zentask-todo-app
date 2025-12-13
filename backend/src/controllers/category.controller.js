import db from "../models/index.js";
import { asyncHandler } from "../utils/jwt.util.js";
import { Op } from "sequelize";

const getAllCategories = asyncHandler(async (req, res) => {
  const userId = req.user.id;

  const categories = await db.Category.findAll({
    where: {
      user_id: userId,
      workspace_id: null, // Personal categories only
    },
    order: [["created_at", "DESC"]],
  });

  return res.status(200).json({
    message: "Lấy danh sách categories thành công",
    data: categories,
  });
});

const createCategory = asyncHandler(async (req, res) => {
  const userId = req.user.id;
  const { name, color } = req.body;

  const category = await db.Category.create({
    name,
    color: color || "#808080",
    user_id: userId,
    workspace_id: null, // Personal category
  });

  return res.status(201).json({
    message: "Tạo category thành công",
    data: category,
  });
});

const updateCategory = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const userId = req.user.id;
  const { name, color } = req.body;

  const category = await db.Category.findOne({
    where: {
      id: id,
      user_id: userId,
      workspace_id: null, // Personal categories only
    },
  });

  if (!category) {
    return res.status(404).json({
      message: "Category không tồn tại hoặc bạn không có quyền chỉnh sửa",
    });
  }

  category.name = name ?? category.name;
  category.color = color ?? category.color;

  await category.save();

  return res.status(200).json({
    message: "Cập nhật category thành công",
    data: category,
  });
});

const deleteCategory = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const userId = req.user.id;

  const category = await db.Category.findOne({
    where: {
      id: id,
      user_id: userId,
      workspace_id: null, // Personal categories only
    },
  });

  if (!category) {
    return res.status(404).json({
      message: "Category không tồn tại hoặc bạn không có quyền xóa",
    });
  }

  await category.destroy();

  return res.status(200).json({ message: "Xóa category thành công" });
});

export default {
  getAllCategories,
  createCategory,
  updateCategory,
  deleteCategory,
};
