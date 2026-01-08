import { asyncHandler } from "../utils/jwt.util.js";
import workspaceService from "../services/workspace.service.js";
import memberService from "../services/member.service.js";
import invitationService from "../services/invitation.service.js";

const getUserWorkspaces = asyncHandler(async (req, res) => {
  const userId = req.user.id;
  const { page = 1, limit = 6 } = req.query;

  try {
    const { workspaces, meta } = await workspaceService.getUserWorkspaces(
      userId,
      page,
      limit
    );

    return res.status(200).json({
      message: "Lấy danh sách workspaces thành công",
      data: workspaces,
      meta,
    });
  } catch (error) {
    console.error("Error getting user workspaces:", error);
    return res.status(500).json({
      message: "Lỗi hệ thống khi lấy danh sách workspaces",
    });
  }
});

const createWorkspace = asyncHandler(async (req, res) => {
  const userId = req.user.id;
  const { name, description } = req.body;

  try {
    const createdWorkspace = await workspaceService.createWorkspace(
      userId,
      name,
      description
    );

    return res.status(201).json({
      message: "Tạo workspace thành công",
      data: createdWorkspace,
    });
  } catch (error) {
    console.error("Error creating workspace:", error);
    return res.status(500).json({
      message: "Lỗi hệ thống khi tạo workspace",
    });
  }
});

const getWorkspaceById = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const userId = req.user.id;

  try {
    const workspace = await workspaceService.getWorkspaceById(id, userId);

    return res.status(200).json({
      message: "Lấy workspace thành công",
      data: workspace,
    });
  } catch (error) {
    return res.status(404).json({
      message: error.message,
    });
  }
});

const updateWorkspace = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const userId = req.user.id;
  const { name, description } = req.body;

  try {
    const workspace = await workspaceService.updateWorkspace(
      id,
      userId,
      name,
      description
    );

    return res.status(200).json({
      message: "Cập nhật workspace thành công",
      data: workspace,
    });
  } catch (error) {
    return res.status(404).json({
      message: error.message,
    });
  }
});

const deleteWorkspace = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const userId = req.user.id;

  try {
    await workspaceService.deleteWorkspace(id, userId);

    return res.status(200).json({ message: "Xóa workspace thành công" });
  } catch (error) {
    return res.status(404).json({
      message: error.message,
    });
  }
});

const addWorkspaceMember = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const userId = req.user.id;
  const { email, role = "member" } = req.body;
  const workspaceId = parseInt(id);

  try {
    const member = await memberService.addWorkspaceMember(
      workspaceId,
      userId,
      email,
      role
    );

    return res.status(201).json({
      message: "Thêm thành viên thành công",
      data: member,
    });
  } catch (error) {
    const statusCode = error.message.includes("không có quyền")
      ? 403
      : error.message.includes("không tồn tại")
      ? 404
      : 400;

    return res.status(statusCode).json({
      message: error.message,
    });
  }
});

const updateWorkspaceMember = asyncHandler(async (req, res) => {
  const { id, memberId } = req.params;
  const userId = req.user.id;
  const { role } = req.body;
  const workspaceId = parseInt(id);
  const targetUserId = parseInt(memberId);

  try {
    const member = await memberService.updateWorkspaceMember(
      workspaceId,
      userId,
      targetUserId,
      role
    );

    return res.status(200).json({
      message: "Cập nhật thành viên thành công",
      data: member,
    });
  } catch (error) {
    const statusCode = error.message.includes("không có quyền")
      ? 403
      : error.message.includes("không tồn tại")
      ? 404
      : 400;

    return res.status(statusCode).json({
      message: error.message,
    });
  }
});

const removeWorkspaceMember = asyncHandler(async (req, res) => {
  const { id, memberId } = req.params;
  const userId = req.user.id;
  const workspaceId = parseInt(id);
  const targetUserId = parseInt(memberId);

  if (isNaN(workspaceId) || isNaN(targetUserId)) {
    return res.status(400).json({
      message: "ID không hợp lệ",
    });
  }

  try {
    await memberService.removeWorkspaceMember(
      workspaceId,
      userId,
      targetUserId
    );

    return res.status(200).json({ message: "Xóa thành viên thành công" });
  } catch (error) {
    const statusCode = error.message.includes("không có quyền")
      ? 403
      : error.message.includes("không tồn tại")
      ? 404
      : 400;

    return res.status(statusCode).json({
      message: error.message,
    });
  }
});

const acceptWorkspaceInvitation = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const userId = req.user.id;
  const workspaceId = parseInt(id);

  try {
    await invitationService.acceptWorkspaceInvitation(workspaceId, userId);

    return res.status(200).json({
      message: "Đã chấp nhận lời mời tham gia workspace",
    });
  } catch (error) {
    const statusCode = error.message.includes("không có lời mời")
      ? 404
      : error.message.includes("đã chấp nhận")
      ? 400
      : 500;

    return res.status(statusCode).json({
      message: error.message,
    });
  }
});

const declineWorkspaceInvitation = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const userId = req.user.id;
  const workspaceId = parseInt(id);

  try {
    await invitationService.declineWorkspaceInvitation(workspaceId, userId);

    return res.status(200).json({
      message: "Đã từ chối lời mời tham gia workspace",
    });
  } catch (error) {
    const statusCode = error.message.includes("không có lời mời")
      ? 404
      : error.message.includes("đã từ chối")
      ? 400
      : 500;

    return res.status(statusCode).json({
      message: error.message,
    });
  }
});

const leaveWorkspace = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const userId = req.user.id;
  const workspaceId = parseInt(id);

  try {
    await invitationService.leaveWorkspace(workspaceId, userId);

    return res.status(200).json({
      message: "Đã rời khỏi workspace thành công",
    });
  } catch (error) {
    const statusCode = error.message.includes("không phải là thành viên")
      ? 404
      : error.message.includes("Owner không thể")
      ? 400
      : 500;

    return res.status(statusCode).json({
      message: error.message,
    });
  }
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
  acceptWorkspaceInvitation,
  declineWorkspaceInvitation,
  leaveWorkspace,
};
