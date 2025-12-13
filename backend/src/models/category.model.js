import { DataTypes } from "sequelize";
import sequelize from "../config/db.js";

const Category = sequelize.define(
  "Category",
  {
    id: { type: DataTypes.INTEGER, autoIncrement: true, primaryKey: true },
    name: { type: DataTypes.STRING(100), allowNull: false },
    color: {
      type: DataTypes.STRING(20),
      allowNull: false,
      defaultValue: "#808080",
    },
    user_id: { type: DataTypes.INTEGER, allowNull: false },
    workspace_id: { type: DataTypes.INTEGER, allowNull: true },
  },
  {
    tableName: "categories",
    timestamps: true,
    createdAt: "created_at",
    updatedAt: false,
  }
);

export default Category;
