import { DataTypes } from "sequelize";
import sequelize from "../config/db.js";

const Notification = sequelize.define(
  "Notification",
  {
    id: { type: DataTypes.INTEGER, autoIncrement: true, primaryKey: true },

    recipient_id: { type: DataTypes.INTEGER, allowNull: false },
    sender_id: { type: DataTypes.INTEGER, allowNull: true },

    type: {
      type: DataTypes.ENUM(
        "workspace_invite",
        "task_assigned",
        "task_deadline",
        "new_comment",
        "task_completed"
      ),
      allowNull: false,
    },

    reference_id: { type: DataTypes.INTEGER, allowNull: true },
    reference_type: {
      type: DataTypes.ENUM("task", "workspace"),
      allowNull: true,
    },

    message: { type: DataTypes.TEXT, allowNull: false },
    is_read: { type: DataTypes.BOOLEAN, defaultValue: false },
  },
  {
    tableName: "notifications",
    timestamps: true,
    createdAt: "created_at",
    updatedAt: false,
  }
);

export default Notification;
