import { Router } from "express";
import taskController from "../controllers/task.controller.js";
import {
  validateCreateTask,
  validateUpdateTask,
  validateTaskId,
} from "../validators/task.validator.js";
import { validate } from "../middleware/validate.middleware.js";
import { authMiddleware } from "../middleware/auth.middleware.js";

const router = Router();
router.use(authMiddleware);

router.get("/stats", taskController.getTaskStats);
router.get("/", taskController.getAllTask);
router.get("/:id", validateTaskId, validate, taskController.getTaskById);
router.post("/", validateCreateTask, validate, taskController.createTask);
router.put("/:id", validateUpdateTask, validate, taskController.updateTask);
router.delete("/:id", validateTaskId, validate, taskController.deleteTask);

export default router;
