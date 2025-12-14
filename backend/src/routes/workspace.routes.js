import express from "express";
import workspaceController from "../controllers/workspace.controller.js";
import { authMiddleware } from "../middleware/auth.middleware.js";

const router = express.Router();

// All workspace routes require authentication
router.use(authMiddleware);

// Workspace CRUD
router.get("/", workspaceController.getUserWorkspaces);
router.post("/", workspaceController.createWorkspace);
router.get("/:id", workspaceController.getWorkspaceById);
router.put("/:id", workspaceController.updateWorkspace);
router.delete("/:id", workspaceController.deleteWorkspace);

// Workspace member management
router.post("/:id/members", workspaceController.addWorkspaceMember);
router.put("/:id/members/:memberId", workspaceController.updateWorkspaceMember);
router.delete(
  "/:id/members/:memberId",
  workspaceController.removeWorkspaceMember
);

export default router;
