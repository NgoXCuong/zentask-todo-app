import db from "../models/index.js";
import { asyncHandler } from "../utils/jwt.util.js";
import { Op } from "sequelize";

const getUserWorkspaces = asyncHandler(async (req, res) => {
  const userId = req.user.id;

  const workspaces = await db.Workspace.findAll({
    where: { owner_id: userId },
    include: [
      {
        model: db.WorkspaceMember,
        include: [{ model: db.User, attributes: ["id", "full_name", "email"] }],
      },
    ],
    order: [["created_at", "DESC"]],
  });

  // Also get workspaces where user is a member
  const memberWorkspaces = await db.Workspace.findAll({
    include: [
      {
        model: db.WorkspaceMember,
        where: { user_id: userId },
        required: true,
        include: [{ model: db.User, attributes: ["id", "full_name", "email"] }],
      },
    ],
    order: [["created_at", "DESC"]],
  });

  // Combine and remove duplicates
  const allWorkspaces = [...workspaces];
  memberWorkspaces.forEach((ws) => {
    if (!allWorkspaces.find((w) => w.id === ws.id)) {
      allWorkspaces.push(ws);
    }
  });

  return res.status(200).json({
    message: "Lấy danh sách workspaces thành công",
    data: allWorkspaces,
  });
});

const createWorkspace = asyncHandler(async (req, res) => {
  const userId = req.user.id;
  const { name, description } = req.body;

  const workspace = await db.Workspace.create({
    name,
    description,
    owner_id: userId,
  });

  // Add owner as a member with 'owner' role
  await db.WorkspaceMember.create({
    workspace_id: workspace.id,
    user_id: userId,
    role: "owner",
  });

  // Fetch created workspace with members
  const createdWorkspace = await db.Workspace.findByPk(workspace.id, {
    include: [
      {
        model: db.WorkspaceMember,
        include: [{ model: db.User, attributes: ["id", "full_name", "email"] }],
      },
    ],
  });

  return res.status(201).json({
    message: "Tạo workspace thành công",
    data: createdWorkspace,
  });
});

const getWorkspaceById = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const userId = req.user.id;

  // Check if user is owner or member
  const workspace = await db.Workspace.findOne({
    where: { id },
    include: [
      {
        model: db.WorkspaceMember,
        where: { user_id: userId },
        required: false,
      },
    ],
  });

  if (
    !workspace ||
    (workspace.owner_id !== userId && !workspace.WorkspaceMembers.length)
  ) {
    return res.status(404).json({
      message: "Workspace không tồn tại hoặc bạn không có quyền truy cập",
    });
  }

  // Get full workspace data
  const fullWorkspace = await db.Workspace.findByPk(id, {
    include: [
      {
        model: db.WorkspaceMember,
        include: [{ model: db.User, attributes: ["id", "full_name", "email"] }],
      },
    ],
  });

  return res.status(200).json({
    message: "Lấy workspace thành công",
    data: fullWorkspace,
  });
});

const updateWorkspace = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const userId = req.user.id;
  const { name, description } = req.body;

  const workspace = await db.Workspace.findOne({
    where: { id, owner_id: userId },
  });

  if (!workspace) {
    return res.status(404).json({
      message: "Workspace không tồn tại hoặc bạn không có quyền chỉnh sửa",
    });
  }

  workspace.name = name ?? workspace.name;
  workspace.description = description ?? workspace.description;

  await workspace.save();

  return res.status(200).json({
    message: "Cập nhật workspace thành công",
    data: workspace,
  });
});

const deleteWorkspace = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const userId = req.user.id;

  const workspace = await db.Workspace.findOne({
    where: { id, owner_id: userId },
  });

  if (!workspace) {
    return res.status(404).json({
      message: "Workspace không tồn tại hoặc bạn không có quyền xóa",
    });
  }

  await workspace.destroy();

  return res.status(200).json({ message: "Xóa workspace thành công" });
});

const addWorkspaceMember = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const userId = req.user.id;
  const { email, role = "member" } = req.body;

  // Check if user is owner or admin
  const workspace = await db.Workspace.findOne({
    where: { id },
    include: [
      {
        model: db.WorkspaceMember,
        where: { user_id: userId, role: { [Op.in]: ["owner", "admin"] } },
        required: true,
      },
    ],
  });

  if (!workspace) {
    return res.status(403).json({
      message: "Bạn không có quyền thêm thành viên",
    });
  }

  // Find user by email
  const userToAdd = await db.User.findOne({ where: { email } });
  if (!userToAdd) {
    return res.status(404).json({ message: "User không tồn tại" });
  }

  // Check if already a member
  const existingMember = await db.WorkspaceMember.findOne({
    where: { workspace_id: id, user_id: userToAdd.id },
  });

  if (existingMember) {
    return res.status(400).json({ message: "User đã là thành viên" });
  }

  const member = await db.WorkspaceMember.create({
    workspace_id: id,
    user_id: userToAdd.id,
    role,
  });

  // Fetch with user info
  const memberWithUser = await db.WorkspaceMember.findByPk(member.id, {
    include: [{ model: db.User, attributes: ["id", "full_name", "email"] }],
  });

  return res.status(201).json({
    message: "Thêm thành viên thành công",
    data: memberWithUser,
  });
});

const updateWorkspaceMember = asyncHandler(async (req, res) => {
  const { id, memberId } = req.params;
  const userId = req.user.id;
  const { role } = req.body;

  // Check if user is owner or admin
  const workspace = await db.Workspace.findOne({
    where: { id },
    include: [
      {
        model: db.WorkspaceMember,
        where: { user_id: userId, role: { [Op.in]: ["owner", "admin"] } },
        required: true,
      },
    ],
  });

  if (!workspace) {
    return res.status(403).json({
      message: "Bạn không có quyền cập nhật thành viên",
    });
  }

  const member = await db.WorkspaceMember.findOne({
    where: { id: memberId, workspace_id: id },
  });

  if (!member) {
    return res.status(404).json({ message: "Thành viên không tồn tại" });
  }

  // Owner cannot change their own role or be demoted
  if (member.role === "owner") {
    return res
      .status(400)
      .json({ message: "Không thể thay đổi quyền của owner" });
  }

  member.role = role;
  await member.save();

  // Fetch with user info
  const updatedMember = await db.WorkspaceMember.findByPk(member.id, {
    include: [{ model: db.User, attributes: ["id", "full_name", "email"] }],
  });

  return res.status(200).json({
    message: "Cập nhật thành viên thành công",
    data: updatedMember,
  });
});

const removeWorkspaceMember = asyncHandler(async (req, res) => {
  const { id, memberId } = req.params;
  const userId = req.user.id;

  // Check if user is owner or admin
  const workspace = await db.Workspace.findOne({
    where: { id },
    include: [
      {
        model: db.WorkspaceMember,
        where: { user_id: userId, role: { [Op.in]: ["owner", "admin"] } },
        required: true,
      },
    ],
  });

  if (!workspace) {
    return res.status(403).json({
      message: "Bạn không có quyền xóa thành viên",
    });
  }

  const member = await db.WorkspaceMember.findOne({
    where: { id: memberId, workspace_id: id },
  });

  if (!member) {
    return res.status(404).json({ message: "Thành viên không tồn tại" });
  }

  // Cannot remove owner
  if (member.role === "owner") {
    return res.status(400).json({ message: "Không thể xóa owner" });
  }

  await member.destroy();

  return res.status(200).json({ message: "Xóa thành viên thành công" });
});

export default {
  getUserWorkspaces,
  createWorkspace,
  getWorkspaceById,
  updateWorkspace,
  deleteWorkspace,
  addWorkspaceMember,
  updateWorkspaceMember,
  removeWorkspaceMember,
};
