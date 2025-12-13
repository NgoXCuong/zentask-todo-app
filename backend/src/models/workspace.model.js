import { DataTypes } from "sequelize";
import sequelize from "../config/db.js";

const Workspace = sequelize.define(
  "Workspace",
  {
    id: { type: DataTypes.INTEGER, autoIncrement: true, primaryKey: true },
    name: { type: DataTypes.STRING(150), allowNull: false },
    owner_id: { type: DataTypes.INTEGER, allowNull: false },
    description: { type: DataTypes.TEXT, allowNull: true },
  },
  {
    tableName: "workspaces",
    timestamps: true,
    createdAt: "created_at",
    updatedAt: false,
  }
);

export default Workspace;
