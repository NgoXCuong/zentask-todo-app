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
import passport from "../config/passport.js";
import User from "../models/user.model.js";

const router = express.Router();

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
router.post("/forgot-password", userController.forgotPassword);
router.post("/reset-password", userController.resetPassword);
router.post("/refresh-token", userController.refreshToken);

// Google OAuth routes
router.get(
  "/auth/google",
  passport.authenticate("google", { scope: ["profile", "email"] })
);

router.get(
  "/auth/google/callback",
  passport.authenticate("google", { failureRedirect: "/login" }),
  async (req, res) => {
    // Successful authentication
    if (req.user) {
      // Create JWT tokens for the OAuth user
      const { createAccessToken, createRefreshToken } = await import(
        "../utils/jwt.util.js"
      );

      const payload = { id: req.user.id, email: req.user.email };
      const accessToken = createAccessToken(payload);
      const refreshToken = createRefreshToken(payload);

      // Update refresh token in database
      await User.update(
        { refresh_token_hash: refreshToken },
        { where: { id: req.user.id } }
      );

      // Set cookies
      const isProduct = process.env.NODE_ENV === "production";
      const cookieOptions = {
        httpOnly: true,
        secure: isProduct,
        sameSite: isProduct ? "strict" : "lax",
      };

      res.cookie("accessToken", accessToken, {
        ...cookieOptions,
        maxAge: 30 * 60 * 1000,
      });
      res.cookie("refreshToken", refreshToken, {
        ...cookieOptions,
        maxAge: 7 * 24 * 60 * 60 * 1000,
      });

      // Redirect to frontend login with success parameter
      res.redirect(
        `${
          process.env.FRONTEND_URL || "http://localhost:5173"
        }/login?oauth=success`
      );
    } else {
      // Authentication failed
      res.redirect(
        `${
          process.env.FRONTEND_URL || "http://localhost:5173"
        }/login?error=oauth_failed`
      );
    }
  }
);

export default router;
