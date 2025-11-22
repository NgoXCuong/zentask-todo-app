import { DataTypes } from "sequelize";
import sequelize from "../config/db.js";

const Task = sequelize.define(
  "Task",
  {
    id: { type: DataTypes.INTEGER, autoIncrement: true, primaryKey: true },
    user_id: { type: DataTypes.INTEGER, allowNull: false },
    title: { type: DataTypes.STRING, allowNull: false },
    description: DataTypes.TEXT,
    status: {
      type: DataTypes.ENUM("pending", "inprogress", "completed"),
      allowNull: false,
      defaultValue: "pending",
    },
    due_date: { type: DataTypes.DATE },
  },
  {
    tableName: "tasks",
    timestamps: true,
    createdAt: "created_at",
    updatedAt: "updated_at",
  }
);

export default Task;
