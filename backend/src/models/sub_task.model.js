import { DataTypes } from "sequelize";
import sequelize from "../config/db.js";

const SubTask = sequelize.define(
  "SubTask",
  {
    id: { type: DataTypes.INTEGER, autoIncrement: true, primaryKey: true },
    task_id: { type: DataTypes.INTEGER, allowNull: false },
    title: { type: DataTypes.STRING(255), allowNull: false },
    is_done: { type: DataTypes.BOOLEAN, allowNull: false, defaultValue: false },
  },
  {
    tableName: "sub_tasks",
    timestamps: true,
    createdAt: "created_at",
    updatedAt: false,
  }
);

export default SubTask;
