import { DataTypes } from "sequelize";
import sequelize from "../config/db.js";

const ActivityLog = sequelize.define(
  "ActivityLog",
  {
    id: { type: DataTypes.INTEGER, autoIncrement: true, primaryKey: true },

    workspace_id: { type: DataTypes.INTEGER, allowNull: true },
    task_id: { type: DataTypes.INTEGER, allowNull: true },
    user_id: { type: DataTypes.INTEGER, allowNull: false },

    action: { type: DataTypes.STRING(50), allowNull: false },

    entity_name: { type: DataTypes.STRING(100), allowNull: true },
    old_value: { type: DataTypes.TEXT, allowNull: true },
    new_value: { type: DataTypes.TEXT, allowNull: true },

    description: { type: DataTypes.TEXT, allowNull: true },
  },
  {
    tableName: "activity_logs",
    timestamps: true,
    createdAt: "created_at",
    updatedAt: false,
  }
);

export default ActivityLog;
