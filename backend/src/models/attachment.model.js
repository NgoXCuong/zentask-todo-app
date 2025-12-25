import { DataTypes } from "sequelize";
import sequelize from "../config/db.js";

const Attachment = sequelize.define(
  "Attachment",
  {
    id: { type: DataTypes.INTEGER, autoIncrement: true, primaryKey: true },

    task_id: { type: DataTypes.INTEGER, allowNull: false },
    user_id: { type: DataTypes.INTEGER, allowNull: false },

    file_name: { type: DataTypes.STRING(255), allowNull: false },
    file_path: { type: DataTypes.TEXT, allowNull: false },
    file_type: { type: DataTypes.STRING(50), allowNull: true },
    file_size: { type: DataTypes.BIGINT, allowNull: true },
  },
  {
    tableName: "attachments",
    timestamps: true,
    createdAt: "created_at",
    updatedAt: false,
  }
);

export default Attachment;
