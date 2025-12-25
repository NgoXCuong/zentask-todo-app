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

// Workspace invitation management
router.post(
  "/:id/accept-invitation",
  workspaceController.acceptWorkspaceInvitation
);
router.post(
  "/:id/decline-invitation",
  workspaceController.declineWorkspaceInvitation
);

// Leave workspace
router.post("/:id/leave", workspaceController.leaveWorkspace);

export default router;
