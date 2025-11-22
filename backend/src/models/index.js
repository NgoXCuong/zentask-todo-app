import User from "./user.model.js";
import Task from "./task.model.js";

User.hasMany(Task, { foreignKey: "user_id", onDelete: "CASCADE" });
Task.belongsTo(User, { foreignKey: "user_id", onDelete: "CASCADE" });

const db = { User, Task };

export default db;
