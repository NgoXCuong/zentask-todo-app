import express from "express";
import userController from "../controllers/user.controller.js";
import {
  validateRegister,
  validateLogin,
} from "../validators/auth.validator.js";
import { authMiddleware } from "../middleware/auth.middleware.js";
import { validate } from "../middleware/validate.middleware.js";

const router = express.Router();

// Tạo user mới
router.post("/register", validateRegister, validate, userController.register);
router.post("/login", validateLogin, validate, userController.login);
router.get("/auth", authMiddleware, userController.authUser);
router.post("/logout", authMiddleware, userController.logout);

export default router;
