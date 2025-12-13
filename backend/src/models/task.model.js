import { DataTypes } from "sequelize";
import sequelize from "../config/db.js";

const Task = sequelize.define(
  "Task",
  {
    id: { type: DataTypes.INTEGER, autoIncrement: true, primaryKey: true },

    workspace_id: { type: DataTypes.INTEGER, allowNull: true },
    category_id: { type: DataTypes.INTEGER, allowNull: true },

    creator_id: { type: DataTypes.INTEGER, allowNull: false },
    assignee_id: { type: DataTypes.INTEGER, allowNull: true },

    title: { type: DataTypes.STRING(255), allowNull: false },
    description: DataTypes.TEXT,

    status: {
      type: DataTypes.ENUM("pending", "inprogress", "completed", "review"),
      allowNull: false,
      defaultValue: "pending",
    },
    priority: {
      type: DataTypes.ENUM("low", "medium", "high", "urgent"),
      allowNull: false,
      defaultValue: "medium",
    },

    start_date: { type: DataTypes.DATE, allowNull: true },
    due_date: { type: DataTypes.DATE, allowNull: true },
    reminder_at: { type: DataTypes.DATE, allowNull: true },

    completed_at: { type: DataTypes.DATE, allowNull: true },
    deleted_at: { type: DataTypes.DATE, allowNull: true },
  },
  {
    tableName: "tasks",
    timestamps: true,
    createdAt: "created_at",
    updatedAt: "updated_at",
    paranoid: true, // Enable soft delete with deleted_at
    deletedAt: "deleted_at",
  }
);

export default Task;
