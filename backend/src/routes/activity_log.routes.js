import { Router } from "express";
import activityLogController from "../controllers/activity_log.controller.js";
import { authMiddleware } from "../middleware/auth.middleware.js";

const router = Router();
router.use(authMiddleware);

router.get("/", activityLogController.getActivityLogs);
router.get("/stats", activityLogController.getActivityStats);
router.post("/", activityLogController.createActivityLog);

export default router;
