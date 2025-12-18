import taskRoutes from "./task.routes.js";
import userRoutes from "./user.routes.js";
import categoryRoutes from "./category.routes.js";
import workspaceRoutes from "./workspace.routes.js";

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
];

export default routes;
