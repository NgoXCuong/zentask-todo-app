import db from "../models/index.js";
import { Op } from "sequelize";

class WorkspaceService {
  async getUserWorkspaces(userId, page = 1, limit = 6) {
    // Get workspaces where user is owner
    const ownerWorkspaces = await db.Workspace.findAll({
      where: { owner_id: userId },
      order: [["created_at", "DESC"]],
    });

    // Get workspaces where user is a member (filter by status later)
    const memberWorkspaceIds = await db.WorkspaceMember.findAll({
      where: {
        user_id: userId,
        status: "active",
      },
      attributes: ["workspace_id"],
    });

    const workspaceIds = memberWorkspaceIds.map((m) => m.workspace_id);

    // Get workspaces with all their members
    const allMemberWorkspaces = await db.Workspace.findAll({
      where: { id: { [Op.in]: workspaceIds } },
      include: [
        {
          model: db.WorkspaceMember,
          required: false, // Include all members, not just the current user
          include: [
            { model: db.User, attributes: ["id", "full_name", "email"] },
          ],
        },
      ],
      order: [["created_at", "DESC"]],
    });

    // Filter workspaces where user has active status (though we already filtered above)
    const memberWorkspaces = allMemberWorkspaces.filter((workspace) => {
      const memberRecord = workspace.WorkspaceMembers.find(
        (member) => member.user_id === userId && member.status === "active"
      );
      return memberRecord;
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

    // Get owner user information for workspaces where user is owner
    const ownerUserIds = [...new Set(ownerWorkspaces.map((ws) => ws.owner_id))];
    const ownerUsers = await db.User.findAll({
      where: { id: { [Op.in]: ownerUserIds } },
      attributes: ["id", "full_name", "email"],
    });

    // Create a map for quick lookup
    const ownerUserMap = {};
    ownerUsers.forEach((user) => {
      ownerUserMap[user.id] = user;
    });

    // Combine workspaces and add members
    const allWorkspaces = [];

    // Add owner workspaces with their members
    ownerWorkspaces.forEach((workspace) => {
      const members = ownerWorkspaceMembers.filter(
        (member) => member.workspace_id === workspace.id
      );

      // Ensure owner is included in members list with correct role
      const ownerMember = members.find(
        (member) => member.user_id === workspace.owner_id
      );
      if (!ownerMember) {
        // If owner is not in members list, add them with real user data
        const ownerUser = ownerUserMap[workspace.owner_id];
        members.push({
          id: `owner-${workspace.id}`,
          user_id: workspace.owner_id,
          workspace_id: workspace.id,
          role: "owner",
          status: "active",
          User: ownerUser || {
            id: workspace.owner_id,
            full_name: "Unknown Owner",
            email: "",
          },
        });
      }

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

    return {
      workspaces: paginatedWorkspaces,
      meta: {
        total: allWorkspaces.length,
        page: parseInt(page),
        limit: parseInt(limit),
        totalPages: totalPages,
      },
    };
  }

  async createWorkspace(userId, name, description) {
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
          include: [
            { model: db.User, attributes: ["id", "full_name", "email"] },
          ],
        },
      ],
    });

    return createdWorkspace;
  }

  async getWorkspaceById(id, userId) {
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
      throw new Error(
        "Workspace không tồn tại hoặc bạn không có quyền truy cập"
      );
    }

    // Get full workspace data
    const fullWorkspace = await db.Workspace.findByPk(id, {
      include: [
        {
          model: db.WorkspaceMember,
          include: [
            { model: db.User, attributes: ["id", "full_name", "email"] },
          ],
        },
      ],
    });

    return fullWorkspace;
  }

  async updateWorkspace(id, userId, name, description) {
    const workspace = await db.Workspace.findOne({
      where: { id, owner_id: userId },
    });

    if (!workspace) {
      throw new Error(
        "Workspace không tồn tại hoặc bạn không có quyền chỉnh sửa"
      );
    }

    workspace.name = name ?? workspace.name;
    workspace.description = description ?? workspace.description;

    await workspace.save();

    return workspace;
  }

  async deleteWorkspace(id, userId) {
    const workspace = await db.Workspace.findOne({
      where: { id, owner_id: userId },
    });

    if (!workspace) {
      throw new Error("Workspace không tồn tại hoặc bạn không có quyền xóa");
    }

    await workspace.destroy();

    return true;
  }
}

export default new WorkspaceService();
