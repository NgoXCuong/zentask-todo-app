import User from "./user.model.js";
import Task from "./task.model.js";
import Workspace from "./workspace.model.js";
import WorkspaceMember from "./workspace_member.model.js";
import Category from "./category.model.js";
import SubTask from "./sub_task.model.js";
import Comment from "./comment.model.js";
import Notification from "./notification.model.js";
import Attachment from "./attachment.model.js";
import ActivityLog from "./activity_log.model.js";
import sequelize from "../config/db.js";

// User associations
User.hasMany(Workspace, { foreignKey: "owner_id", onDelete: "CASCADE" });
User.hasMany(Task, { foreignKey: "creator_id", onDelete: "CASCADE" });
User.hasMany(Task, { foreignKey: "assignee_id", onDelete: "SET NULL" });
User.hasMany(Category, { foreignKey: "user_id", onDelete: "CASCADE" });
User.hasMany(Comment, { foreignKey: "user_id", onDelete: "CASCADE" });
User.hasMany(Notification, { foreignKey: "recipient_id", onDelete: "CASCADE" });
User.hasMany(Notification, { foreignKey: "sender_id", onDelete: "SET NULL" });
User.hasMany(Attachment, { foreignKey: "user_id", onDelete: "CASCADE" });
User.hasMany(ActivityLog, { foreignKey: "user_id", onDelete: "CASCADE" });

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

// Notification associations
Notification.belongsTo(User, {
  foreignKey: "recipient_id",
  onDelete: "CASCADE",
  as: "recipient",
});
Notification.belongsTo(User, {
  foreignKey: "sender_id",
  onDelete: "SET NULL",
  as: "sender",
});

// Attachment associations
Attachment.belongsTo(Task, { foreignKey: "task_id", onDelete: "CASCADE" });
Attachment.belongsTo(User, { foreignKey: "user_id", onDelete: "CASCADE" });

// ActivityLog associations
ActivityLog.belongsTo(Workspace, {
  foreignKey: "workspace_id",
  onDelete: "CASCADE",
});
ActivityLog.belongsTo(Task, { foreignKey: "task_id", onDelete: "SET NULL" });
ActivityLog.belongsTo(User, { foreignKey: "user_id", onDelete: "CASCADE" });

const db = {
  User,
  Task,
  Workspace,
  WorkspaceMember,
  Category,
  SubTask,
  Comment,
  Notification,
  Attachment,
  ActivityLog,
  sequelize,
};

export default db;
