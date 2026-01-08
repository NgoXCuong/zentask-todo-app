import db from "../models/index.js";
import { Op } from "sequelize";

class MemberService {
  async addWorkspaceMember(workspaceId, userId, email, role = "member") {
    // Check if user is owner or admin
    const workspace = await db.Workspace.findOne({
      where: { id: workspaceId },
      include: [
        {
          model: db.WorkspaceMember,
          where: { user_id: userId, role: { [Op.in]: ["owner", "admin"] } },
          required: true,
        },
      ],
    });

    if (!workspace) {
      throw new Error("Bạn không có quyền thêm thành viên");
    }

    // Find user by email
    const userToAdd = await db.User.findOne({ where: { email } });
    if (!userToAdd) {
      throw new Error("User không tồn tại");
    }

    // Prevent users from inviting themselves
    if (userToAdd.id === userId) {
      throw new Error("Bạn không thể tự mời chính mình");
    }

    // Check if already a member
    const existingMember = await db.WorkspaceMember.findOne({
      where: { workspace_id: workspaceId, user_id: userToAdd.id },
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
          reference_id: workspaceId,
          reference_type: "workspace",
          message: `Bạn đã được mời lại tham gia workspace "${workspace.name}" với vai trò ${role}`,
          is_read: false,
        });

        return existingMember;
      } else if (existingMember.status === "active") {
        throw new Error("User đã là thành viên active");
      } else {
        // Status is "invited" - already invited
        throw new Error("User đã được mời rồi");
      }
    }

    const member = await db.WorkspaceMember.create({
      workspace_id: workspaceId,
      user_id: userToAdd.id,
      role,
      status: "invited", // Explicitly set status to invited
    });

    // Create notification for the invited user
    await db.Notification.create({
      recipient_id: userToAdd.id,
      sender_id: userId, // The person who sent the invitation
      type: "workspace_invite",
      reference_id: workspaceId, // Workspace ID
      reference_type: "workspace",
      message: `Bạn đã được mời tham gia workspace "${workspace.name}" với vai trò ${role}`,
      is_read: false,
    });

    // Fetch with user info
    const memberWithUser = await db.WorkspaceMember.findByPk(member.id, {
      include: [{ model: db.User, attributes: ["id", "full_name", "email"] }],
    });

    return memberWithUser;
  }

  async updateWorkspaceMember(workspaceId, userId, targetUserId, role) {
    // Check if user is owner or admin
    const workspace = await db.Workspace.findOne({
      where: { id: workspaceId },
      include: [
        {
          model: db.WorkspaceMember,
          where: { user_id: userId, role: { [Op.in]: ["owner", "admin"] } },
          required: true,
        },
      ],
    });

    if (!workspace) {
      throw new Error("Bạn không có quyền cập nhật thành viên");
    }

    const member = await db.WorkspaceMember.findOne({
      where: { user_id: targetUserId, workspace_id: workspaceId },
    });

    if (!member) {
      throw new Error("Thành viên không tồn tại");
    }

    // Owner cannot change their own role or be demoted
    if (member.role === "owner") {
      throw new Error("Không thể thay đổi quyền của owner");
    }

    member.role = role;
    await member.save();

    // Fetch with user info
    const updatedMember = await db.WorkspaceMember.findOne({
      where: { user_id: targetUserId, workspace_id: workspaceId },
      include: [{ model: db.User, attributes: ["id", "full_name", "email"] }],
    });

    return updatedMember;
  }

  async removeWorkspaceMember(workspaceId, userId, targetUserId) {
    // Check if user is owner or admin
    const workspace = await db.Workspace.findOne({
      where: { id: workspaceId },
      include: [
        {
          model: db.WorkspaceMember,
          where: { user_id: userId, role: { [Op.in]: ["owner", "admin"] } },
          required: true,
        },
      ],
    });

    if (!workspace) {
      throw new Error("Bạn không có quyền xóa thành viên");
    }

    // Find member by user_id and workspace_id (composite primary key)
    const member = await db.WorkspaceMember.findOne({
      where: { user_id: targetUserId, workspace_id: workspaceId },
    });

    if (!member) {
      throw new Error("Thành viên không tồn tại");
    }

    // Cannot remove owner
    if (member.role === "owner") {
      throw new Error("Không thể xóa owner");
    }

    // Cannot remove yourself if you're not owner
    if (member.user_id === userId) {
      throw new Error("Bạn không thể tự xóa chính mình");
    }

    await member.destroy();

    return true;
  }
}

export default new MemberService();
