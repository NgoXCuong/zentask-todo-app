import taskRoutes from "./task.routes.js";
import userRoutes from "./user.routes.js";
import categoryRoutes from "./category.routes.js";
import workspaceRoutes from "./workspace.routes.js";
import notificationRoutes from "./notification.routes.js";
import attachmentRoutes from "./attachment.routes.js";
import activityLogRoutes from "./activity_log.routes.js";

// Centralized route configuration
// Each route includes its path prefix and router
const routes = [
  {
    path: "/api/tasks",
    router: taskRoutes,
  },
  {
    path: "/api/users",
    router: userRoutes,
  },
  {
    path: "/api/categories",
    router: categoryRoutes,
  },
  {
    path: "/api/workspaces",
    router: workspaceRoutes,
  },
  {
    path: "/api/notifications",
    router: notificationRoutes,
  },
  {
    path: "/api",
    router: attachmentRoutes,
  },
  {
    path: "/api/activity-logs",
    router: activityLogRoutes,
  },
];

export default routes;
