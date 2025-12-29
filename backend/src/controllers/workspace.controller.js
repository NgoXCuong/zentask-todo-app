import db from "../models/index.js";
import { asyncHandler } from "../utils/jwt.util.js";
import { Op } from "sequelize";

const getUserWorkspaces = asyncHandler(async (req, res) => {
  const userId = req.user.id;
  const { page = 1, limit = 6 } = req.query;

  try {
    // Get workspaces where user is owner
    const ownerWorkspaces = await db.Workspace.findAll({
      where: { owner_id: userId },
      order: [["created_at", "DESC"]],
    });

    // Get workspaces where user is a member (filter by status later)
    const allMemberWorkspaces = await db.Workspace.findAll({
      include: [
        {
          model: db.WorkspaceMember,
          where: { user_id: userId },
          required: true,
          include: [
            { model: db.User, attributes: ["id", "full_name", "email"] },
          ],
        },
      ],
      order: [["created_at", "DESC"]],
    });

    // Filter workspaces where user has active status
    const memberWorkspaces = allMemberWorkspaces.filter((workspace) => {
      const memberRecord = workspace.WorkspaceMembers.find(
        (member) => member.user_id === userId
      );
      return memberRecord && memberRecord.status === "active";
    });

    // For owner workspaces, get their members separately
    const ownerWorkspaceIds = ownerWorkspaces.map((ws) => ws.id);
    let ownerWorkspaceMembers = [];

    if (ownerWorkspaceIds.length > 0) {
      ownerWorkspaceMembers = await db.WorkspaceMember.findAll({
        where: { workspace_id: { [Op.in]: ownerWorkspaceIds } },
        include: [{ model: db.User, attributes: ["id", "full_name", "email"] }],
      });
    }

    // Combine workspaces and add members
    const allWorkspaces = [];

    // Add owner workspaces with their members
    ownerWorkspaces.forEach((workspace) => {
      const members = ownerWorkspaceMembers.filter(
        (member) => member.workspace_id === workspace.id
      );
      allWorkspaces.push({
        ...workspace.toJSON(),
        WorkspaceMembers: members,
      });
    });

    // Add member workspaces (avoiding duplicates)
    memberWorkspaces.forEach((workspace) => {
      if (!allWorkspaces.find((w) => w.id === workspace.id)) {
        allWorkspaces.push(workspace.toJSON());
      }
    });

    // Apply pagination
    const offset = (parseInt(page) - 1) * parseInt(limit);
    const paginatedWorkspaces = allWorkspaces.slice(
      offset,
      offset + parseInt(limit)
    );
    const totalPages = Math.ceil(allWorkspaces.length / parseInt(limit));

    return res.status(200).json({
      message: "Lấy danh sách workspaces thành công",
      data: paginatedWorkspaces,
      meta: {
        total: allWorkspaces.length,
        page: parseInt(page),
        limit: parseInt(limit),
        totalPages: totalPages,
      },
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

  const workspace = await db.Workspace.create({
    name,
    description,
    owner_id: userId,
  });

  // Add owner as a member with 'owner' role and active status
  await db.WorkspaceMember.create({
    workspace_id: workspace.id,
    user_id: userId,
    role: "owner",
    status: "active",
    joined_at: new Date(),
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

  // Prevent users from inviting themselves
  if (userToAdd.id === userId) {
    return res.status(400).json({ message: "Bạn không thể tự mời chính mình" });
  }

  // Check if already a member
  const existingMember = await db.WorkspaceMember.findOne({
    where: { workspace_id: id, user_id: userToAdd.id },
  });

  if (existingMember) {
    // If user previously declined, allow re-inviting by changing status back to invited
    if (existingMember.status === "declined") {
      existingMember.status = "invited";
      existingMember.role = role; // Update role if changed
      await existingMember.save();

      // Create notification for the re-invited user
      await db.Notification.create({
        recipient_id: userToAdd.id,
        sender_id: userId,
        type: "workspace_invite",
        reference_id: id,
        reference_type: "workspace",
        message: `Bạn đã được mời tham gia lại workspace "${workspace.name}" với vai trò ${role}`,
        is_read: false,
      });

      return res.status(200).json({
        message: "Đã gửi lại lời mời tham gia workspace",
        data: existingMember,
      });
    } else if (existingMember.status === "active") {
      return res.status(400).json({ message: "User đã là thành viên active" });
    } else {
      // Status is "invited" - already invited
      return res.status(400).json({ message: "User đã được mời rồi" });
    }
  }

  const member = await db.WorkspaceMember.create({
    workspace_id: id,
    user_id: userToAdd.id,
    role,
    status: "invited", // Explicitly set status to invited
  });

  // Create notification for the invited user
  await db.Notification.create({
    recipient_id: userToAdd.id,
    sender_id: userId, // The person who sent the invitation
    type: "workspace_invite",
    reference_id: id, // Workspace ID
    reference_type: "workspace",
    message: `Bạn đã được mời tham gia workspace "${workspace.name}" với vai trò ${role}`,
    is_read: false,
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

const acceptWorkspaceInvitation = asyncHandler(async (req, res) => {
  const { id } = req.params; // workspace id
  const userId = req.user.id;

  try {
    // Find the workspace member record (don't filter by status in SQL)
    const member = await db.WorkspaceMember.findOne({
      where: { workspace_id: parseInt(id), user_id: userId },
    });

    if (!member) {
      return res.status(404).json({
        message: "Bạn không có lời mời tham gia workspace này",
      });
    }

    // Check if already accepted
    if (member.status === "active") {
      return res.status(400).json({
        message: "Bạn đã chấp nhận lời mời này rồi",
      });
    }

    // Update member status to active and set joined_at
    member.status = "active";
    member.joined_at = new Date();
    await member.save();

    // Create notification for the workspace owner/admin who sent the invitation
    const workspace = await db.Workspace.findByPk(parseInt(id));
    if (workspace) {
      await db.Notification.create({
        recipient_id: workspace.owner_id,
        sender_id: userId,
        type: "workspace_invite",
        reference_id: parseInt(id),
        reference_type: "workspace",
        message: `${req.user.full_name} đã chấp nhận lời mời tham gia workspace "${workspace.name}"`,
        is_read: false,
      });
    }

    return res.status(200).json({
      message: "Đã chấp nhận lời mời tham gia workspace",
    });
  } catch (error) {
    console.error("Error accepting workspace invitation:", error);
    return res.status(500).json({
      message: "Lỗi hệ thống khi chấp nhận lời mời",
    });
  }
});

const declineWorkspaceInvitation = asyncHandler(async (req, res) => {
  const { id } = req.params; // workspace id
  const userId = req.user.id;

  try {
    // Find the workspace member record (don't filter by status in SQL)
    const member = await db.WorkspaceMember.findOne({
      where: { workspace_id: parseInt(id), user_id: userId },
    });

    if (!member) {
      return res.status(404).json({
        message: "Bạn không có lời mời tham gia workspace này",
      });
    }

    // Check if already declined
    if (member.status === "declined") {
      return res.status(400).json({
        message: "Bạn đã từ chối lời mời này rồi",
      });
    }

    // Update member status to declined
    member.status = "declined";
    await member.save();

    // Create notification for the workspace owner/admin who sent the invitation
    const workspace = await db.Workspace.findByPk(parseInt(id));
    if (workspace) {
      await db.Notification.create({
        recipient_id: workspace.owner_id,
        sender_id: userId,
        type: "workspace_invite",
        reference_id: parseInt(id),
        reference_type: "workspace",
        message: `${req.user.full_name} đã từ chối lời mời tham gia workspace "${workspace.name}"`,
        is_read: false,
      });
    }

    return res.status(200).json({
      message: "Đã từ chối lời mời tham gia workspace",
    });
  } catch (error) {
    console.error("Error declining workspace invitation:", error);
    return res.status(500).json({
      message: "Lỗi hệ thống khi từ chối lời mời",
    });
  }
});

const leaveWorkspace = asyncHandler(async (req, res) => {
  const { id } = req.params; // workspace id
  const userId = req.user.id;

  try {
    // First check if user is a member of this workspace
    const member = await db.WorkspaceMember.findOne({
      where: {
        workspace_id: parseInt(id),
        user_id: userId,
      },
    });

    if (!member) {
      return res.status(404).json({
        message: "Bạn không phải là thành viên của workspace này",
      });
    }

    // Cannot leave if you're the owner
    if (member.role === "owner") {
      return res.status(400).json({
        message:
          "Owner không thể rời khỏi workspace. Hãy chuyển quyền owner cho người khác trước.",
      });
    }

    // Delete the membership
    await member.destroy();

    // Create notification for the workspace owner
    const workspace = await db.Workspace.findByPk(parseInt(id));
    if (workspace) {
      await db.Notification.create({
        recipient_id: workspace.owner_id,
        sender_id: userId,
        type: "workspace_invite", // Reusing this type for workspace membership changes
        reference_id: parseInt(id),
        reference_type: "workspace",
        message: `${req.user.full_name} đã rời khỏi workspace "${workspace.name}"`,
        is_read: false,
      });
    }

    return res.status(200).json({
      message: "Đã rời khỏi workspace thành công",
    });
  } catch (error) {
    console.error("Error leaving workspace:", error);
    return res.status(500).json({
      message: "Lỗi hệ thống khi rời workspace",
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
