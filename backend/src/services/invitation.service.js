import db from "../models/index.js";

class InvitationService {
  async acceptWorkspaceInvitation(workspaceId, userId) {
    // Find the workspace member record (don't filter by status in SQL)
    const member = await db.WorkspaceMember.findOne({
      where: { workspace_id: workspaceId, user_id: userId },
    });

    if (!member) {
      throw new Error("Bạn không có lời mời tham gia workspace này");
    }

    // Check if already accepted
    if (member.status === "active") {
      throw new Error("Bạn đã chấp nhận lời mời này rồi");
    }

    // Update member status to active and set joined_at
    member.status = "active";
    member.joined_at = new Date();
    await member.save();

    // Create notification for the workspace owner/admin who sent the invitation
    const workspace = await db.Workspace.findByPk(workspaceId);
    if (workspace) {
      // Get the accepting user's full name
      const acceptingUser = await db.User.findByPk(userId, {
        attributes: ["full_name"],
      });

      await db.Notification.create({
        recipient_id: workspace.owner_id,
        sender_id: userId,
        type: "workspace_invite",
        reference_id: workspaceId,
        reference_type: "workspace",
        message: `${
          acceptingUser?.full_name || "Người dùng"
        } đã chấp nhận lời mời tham gia workspace "${workspace.name}"`,
        is_read: false,
      });
    }

    return true;
  }

  async declineWorkspaceInvitation(workspaceId, userId) {
    // Find the workspace member record (don't filter by status in SQL)
    const member = await db.WorkspaceMember.findOne({
      where: { workspace_id: workspaceId, user_id: userId },
    });

    if (!member) {
      throw new Error("Bạn không có lời mời tham gia workspace này");
    }

    // Check if already declined
    if (member.status === "declined") {
      throw new Error("Bạn đã từ chối lời mời này rồi");
    }

    // Update member status to declined
    member.status = "declined";
    await member.save();

    // Create notification for the workspace owner/admin who sent the invitation
    const workspace = await db.Workspace.findByPk(workspaceId);
    if (workspace) {
      await db.Notification.create({
        recipient_id: workspace.owner_id,
        sender_id: userId,
        type: "workspace_invite",
        reference_id: workspaceId,
        reference_type: "workspace",
        message: `Người dùng đã từ chối lời mời tham gia workspace "${workspace.name}"`,
        is_read: false,
      });
    }

    return true;
  }

  async leaveWorkspace(workspaceId, userId) {
    // First check if user is a member of this workspace
    const member = await db.WorkspaceMember.findOne({
      where: {
        workspace_id: workspaceId,
        user_id: userId,
      },
    });

    if (!member) {
      throw new Error("Bạn không phải là thành viên của workspace này");
    }

    // Cannot leave if you're the owner
    if (member.role === "owner") {
      throw new Error(
        "Owner không thể rời khỏi workspace. Hãy chuyển quyền owner cho người khác trước."
      );
    }

    // Delete the membership
    await member.destroy();

    // Create notification for the workspace owner
    const workspace = await db.Workspace.findByPk(workspaceId);
    if (workspace) {
      await db.Notification.create({
        recipient_id: workspace.owner_id,
        sender_id: userId,
        type: "workspace_invite", // Reusing this type for workspace membership changes
        reference_id: workspaceId,
        reference_type: "workspace",
        message: `Người dùng đã rời khỏi workspace "${workspace.name}"`,
        is_read: false,
      });
    }

    return true;
  }
}

export default new InvitationService();
