import { Router } from "express";
import taskController from "../controllers/task.controller.js";
import subTaskController from "../controllers/sub_task.controller.js";
import commentController from "../controllers/comment.controller.js";
import {
  validateCreateTask,
  validateUpdateTask,
  validateTaskId,
} from "../validators/task.validator.js";
import { validate } from "../middleware/validate.middleware.js";
import { authMiddleware } from "../middleware/auth.middleware.js";

const router = Router();
router.use(authMiddleware);

// Task routes
router.get("/stats", taskController.getTaskStats);
router.get("/", taskController.getAllTask);
router.get("/:id", validateTaskId, validate, taskController.getTaskById);
router.post("/", validateCreateTask, validate, taskController.createTask);
router.put("/:id", validateUpdateTask, validate, taskController.updateTask);
router.delete("/:id", validateTaskId, validate, taskController.deleteTask);

// Sub-task routes (nested under tasks)
router.get("/:taskId/sub-tasks", subTaskController.getSubTasksByTaskId);
router.post("/:taskId/sub-tasks", subTaskController.createSubTask);
router.put("/:taskId/sub-tasks/:subTaskId", subTaskController.updateSubTask);
router.delete("/:taskId/sub-tasks/:subTaskId", subTaskController.deleteSubTask);

// Comment routes (nested under tasks)
router.get("/:taskId/comments", commentController.getCommentsByTaskId);
router.post("/:taskId/comments", commentController.createComment);
router.put("/:taskId/comments/:commentId", commentController.updateComment);
router.delete("/:taskId/comments/:commentId", commentController.deleteComment);

export default router;
