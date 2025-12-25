import { Router } from "express";
import attachmentController from "../controllers/attachment.controller.js";
import { authMiddleware } from "../middleware/auth.middleware.js";

const router = Router();
router.use(authMiddleware);

// Attachments are nested under tasks
router.get(
  "/tasks/:taskId/attachments",
  attachmentController.getAttachmentsByTask
);
router.post(
  "/tasks/:taskId/attachments",
  attachmentController.uploadAttachment
);
router.get(
  "/tasks/:taskId/attachments/:attachmentId",
  attachmentController.getAttachmentById
);
router.delete(
  "/tasks/:taskId/attachments/:attachmentId",
  attachmentController.deleteAttachment
);

export default router;
