import { DataTypes } from "sequelize";
import sequelize from "../config/db.js";

const WorkspaceMember = sequelize.define(
  "WorkspaceMember",
  {
    workspace_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
      primaryKey: true,
    },
    user_id: { type: DataTypes.INTEGER, allowNull: false, primaryKey: true },
    role: {
      type: DataTypes.ENUM("owner", "admin", "member", "viewer"),
      allowNull: false,
      defaultValue: "member",
    },
    joined_at: { type: DataTypes.DATE, defaultValue: DataTypes.NOW },
  },
  {
    tableName: "workspace_members",
    timestamps: false,
  }
);

export default WorkspaceMember;
