import { DataTypes } from "sequelize";
import sequelize from "../config/db.js";

const User = sequelize.define(
  "User",
  {
    id: { type: DataTypes.INTEGER, autoIncrement: true, primaryKey: true },
    full_name: { type: DataTypes.STRING(150), allowNull: false },
    email: { type: DataTypes.STRING, allowNull: false, unique: true },
    hash_password: { type: DataTypes.STRING(150), allowNull: false },
    is_active: { type: DataTypes.BOOLEAN, defaultValue: true },
    refresh_token: { type: DataTypes.TEXT, allowNull: true },
    password_reset_token: { type: DataTypes.STRING, allowNull: true },
    password_reset_expires: { type: DataTypes.DATE, allowNull: true },
  },
  {
    tableName: "users",
    timestamps: true,
    createdAt: "created_at",
    updatedAt: "updated_at",
  }
);

export default User;
