import User from "./user.model.js";
import Task from "./task.model.js";
import Workspace from "./workspace.model.js";
import WorkspaceMember from "./workspace_member.model.js";
import Category from "./category.model.js";
import SubTask from "./sub_task.model.js";
import Comment from "./comment.model.js";

// User associations
User.hasMany(Workspace, { foreignKey: "owner_id", onDelete: "CASCADE" });
User.hasMany(Task, { foreignKey: "creator_id", onDelete: "CASCADE" });
User.hasMany(Task, { foreignKey: "assignee_id", onDelete: "SET NULL" });
User.hasMany(Category, { foreignKey: "user_id", onDelete: "CASCADE" });
User.hasMany(Comment, { foreignKey: "user_id", onDelete: "CASCADE" });

// Workspace associations
Workspace.belongsTo(User, { foreignKey: "owner_id", onDelete: "CASCADE" });
Workspace.hasMany(WorkspaceMember, {
  foreignKey: "workspace_id",
  onDelete: "CASCADE",
});
Workspace.hasMany(Task, { foreignKey: "workspace_id", onDelete: "CASCADE" });
Workspace.hasMany(Category, {
  foreignKey: "workspace_id",
  onDelete: "CASCADE",
});

// WorkspaceMember associations (junction table)
WorkspaceMember.belongsTo(Workspace, {
  foreignKey: "workspace_id",
  onDelete: "CASCADE",
});
WorkspaceMember.belongsTo(User, { foreignKey: "user_id", onDelete: "CASCADE" });

// Category associations
Category.belongsTo(User, { foreignKey: "user_id", onDelete: "CASCADE" });
Category.belongsTo(Workspace, {
  foreignKey: "workspace_id",
  onDelete: "CASCADE",
});
Category.hasMany(Task, { foreignKey: "category_id", onDelete: "SET NULL" });

// Task associations
Task.belongsTo(User, {
  foreignKey: "creator_id",
  onDelete: "CASCADE",
  as: "creator",
});
Task.belongsTo(User, {
  foreignKey: "assignee_id",
  onDelete: "SET NULL",
  as: "assignee",
});
Task.belongsTo(Workspace, { foreignKey: "workspace_id", onDelete: "CASCADE" });
Task.belongsTo(Category, { foreignKey: "category_id", onDelete: "SET NULL" });
Task.hasMany(SubTask, { foreignKey: "task_id", onDelete: "CASCADE" });
Task.hasMany(Comment, { foreignKey: "task_id", onDelete: "CASCADE" });

// SubTask associations
SubTask.belongsTo(Task, { foreignKey: "task_id", onDelete: "CASCADE" });

// Comment associations
Comment.belongsTo(Task, { foreignKey: "task_id", onDelete: "CASCADE" });
Comment.belongsTo(User, { foreignKey: "user_id", onDelete: "CASCADE" });

const db = {
  User,
  Task,
  Workspace,
  WorkspaceMember,
  Category,
  SubTask,
  Comment,
};

export default db;
