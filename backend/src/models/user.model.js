import { DataTypes } from "sequelize";
import sequelize from "../config/db.js";

const User = sequelize.define(
  "User",
  {
    id: { type: DataTypes.INTEGER, autoIncrement: true, primaryKey: true },

    full_name: { type: DataTypes.STRING(150), allowNull: false },

    email: { type: DataTypes.STRING(255), allowNull: false, unique: true },

    hash_password: { type: DataTypes.STRING(255), allowNull: true }, // Allow null for OAuth users

    avatar_url: { type: DataTypes.STRING(255), allowNull: true },

    reset_token: { type: DataTypes.STRING(255), allowNull: true },

    reset_token_expires: { type: DataTypes.DATE, allowNull: true },

    is_active: { type: DataTypes.BOOLEAN, defaultValue: true },

    refresh_token_hash: { type: DataTypes.TEXT, allowNull: true },

    // OAuth fields
    google_id: { type: DataTypes.STRING(255), allowNull: true, unique: true },
    provider: {
      type: DataTypes.ENUM("local", "google"),
      defaultValue: "local",
    },
  },
  {
    tableName: "users",
    timestamps: true,
    createdAt: "created_at",
    updatedAt: "updated_at",
  }
);

export default User;
