import express from "express";
import userController from "../controllers/user.controller.js";
import {
  validateRegister,
  validateLogin,
} from "../validators/auth.validator.js";
import { authMiddleware } from "../middleware/auth.middleware.js";
import { validate } from "../middleware/validate.middleware.js";
import { authLimit } from "../middleware/limiter.middleware.js";
import { uploadAvatar } from "../middleware/upload.middleware.js";

const router = express.Router();

// Tạo user mới
router.post(
  "/register",
  authLimit,
  validateRegister,
  validate,
  userController.register
);
router.post("/login", authLimit, validateLogin, validate, userController.login);
router.get("/auth", authMiddleware, userController.authUser);
router.put("/profile", authMiddleware, userController.updateProfile);
router.post(
  "/upload-avatar",
  authMiddleware,
  uploadAvatar,
  userController.uploadAvatar
);
router.post("/logout", authMiddleware, userController.logout);
router.post("/refresh-token", userController.refreshToken);

export default router;
