import db from "../models/index.js";
import { asyncHandler } from "../utils/jwt.util.js";
import { Op } from "sequelize";

const getAllCategories = asyncHandler(async (req, res) => {
  const userId = req.user.id;
  const { workspace_id } = req.query;

  let whereFilter = { user_id: userId };

  if (workspace_id) {
    // Check workspace access
    const memberCheck = await db.WorkspaceMember.findOne({
      where: { workspace_id: parseInt(workspace_id), user_id: userId },
    });

    const workspace = await db.Workspace.findOne({
      where: { id: parseInt(workspace_id), owner_id: userId },
    });

    if (!memberCheck && !workspace) {
      return res.status(403).json({
        message: "Bạn không có quyền truy cập workspace này",
      });
    }

    whereFilter.workspace_id = parseInt(workspace_id);
  } else {
    // Personal categories only
    whereFilter.workspace_id = null;
  }

  const categories = await db.Category.findAll({
    where: whereFilter,
    order: [["created_at", "DESC"]],
  });

  return res.status(200).json({
    message: "Lấy danh sách categories thành công",
    data: categories,
  });
});

const createCategory = asyncHandler(async (req, res) => {
  if (!req.user || !req.user.id) {
    return res.status(401).json({ message: "Authentication required" });
  }
  const userId = req.user.id;
  if (!req.body) {
    return res.status(400).json({ message: "Request body is required" });
  }
  const { name, color, workspace_id } = req.body;

  let finalWorkspaceId = null;

  if (workspace_id) {
    // Check workspace access
    const memberCheck = await db.WorkspaceMember.findOne({
      where: { workspace_id: parseInt(workspace_id), user_id: userId },
    });

    const workspace = await db.Workspace.findOne({
      where: { id: parseInt(workspace_id), owner_id: userId },
    });

    if (!memberCheck && !workspace) {
      return res.status(403).json({
        message: "Bạn không có quyền tạo category trong workspace này",
      });
    }

    finalWorkspaceId = parseInt(workspace_id);
  }

  const category = await db.Category.create({
    name,
    color: color || "#808080",
    user_id: userId,
    workspace_id: finalWorkspaceId,
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

  // First get the category to check permissions
  const category = await db.Category.findByPk(id);
  if (!category) {
    return res.status(404).json({ message: "Category không tồn tại" });
  }

  // Check permissions
  let canUpdate = false;

  if (category.user_id === userId) {
    canUpdate = true;
  } else if (category.workspace_id) {
    // Check workspace admin/owner permissions
    const memberCheck = await db.WorkspaceMember.findOne({
      where: {
        workspace_id: category.workspace_id,
        user_id: userId,
        role: { [Op.in]: ["owner", "admin"] },
      },
    });

    const workspace = await db.Workspace.findOne({
      where: { id: category.workspace_id, owner_id: userId },
    });

    if (memberCheck || workspace) {
      canUpdate = true;
    }
  }

  if (!canUpdate) {
    return res.status(403).json({
      message: "Bạn không có quyền chỉnh sửa category này",
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

  // First get the category to check permissions
  const category = await db.Category.findByPk(id);
  if (!category) {
    return res.status(404).json({ message: "Category không tồn tại" });
  }

  // Check permissions
  let canDelete = false;

  if (category.user_id === userId) {
    canDelete = true;
  } else if (category.workspace_id) {
    // Check workspace admin/owner permissions
    const memberCheck = await db.WorkspaceMember.findOne({
      where: {
        workspace_id: category.workspace_id,
        user_id: userId,
        role: { [Op.in]: ["owner", "admin"] },
      },
    });

    const workspace = await db.Workspace.findOne({
      where: { id: category.workspace_id, owner_id: userId },
    });

    if (memberCheck || workspace) {
      canDelete = true;
    }
  }

  if (!canDelete) {
    return res.status(403).json({
      message: "Bạn không có quyền xóa category này",
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
