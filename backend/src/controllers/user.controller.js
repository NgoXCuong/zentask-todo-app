import { asyncHandler } from "../utils/jwt.util.js";
import authService from "../services/auth.service.js";
import userService from "../services/user.service.js";

class UserController {
  register = asyncHandler(async (req, res) => {
    try {
      const user = await authService.register(req.body);

      return res.status(201).json({ message: "Đăng ký thành công", user });
    } catch (error) {
      return res.status(400).json({ message: error.message });
    }
  });

  login = asyncHandler(async (req, res) => {
    try {
      const { user, tokens } = await authService.login(req.body);

      authService.setCookies(res, tokens.refreshToken, tokens.accessToken);

      return res.status(200).json({
        message: "Đăng nhập thành công",
        user,
      });
    } catch (error) {
      return res.status(401).json({ message: error.message });
    }
  });

  logout = asyncHandler(async (req, res) => {
    try {
      await authService.logout(req.user.id);
      authService.clearCookies(res);

      return res.status(200).json({ message: "Đăng xuất thành công" });
    } catch (error) {
      return res.status(500).json({ message: "Lỗi hệ thống khi đăng xuất" });
    }
  });

  authUser = asyncHandler(async (req, res) => {
    // Try JWT auth first
    if (req.user && req.user.id) {
      try {
        const user = await authService.authUser(req.user.id);

        return res.status(200).json({ message: "Xác thực thành công", user });
      } catch (error) {
        return res.status(404).json({ message: error.message });
      }
    }

    // Try session auth for OAuth users
    if (req.session && req.session.passport && req.session.passport.user) {
      try {
        const user = await authService.authUser(req.session.passport.user);

        return res.status(200).json({ message: "Xác thực thành công", user });
      } catch (error) {
        return res.status(404).json({ message: error.message });
      }
    }

    return res.status(401).json({ message: "Chưa đăng nhập" });
  });

  updateProfile = asyncHandler(async (req, res) => {
    try {
      const user = await userService.updateProfile(req.user.id, req.body);

      return res.status(200).json({
        message: "Cập nhật profile thành công",
        user,
      });
    } catch (error) {
      const statusCode = error.message.includes("không tồn tại") ? 404 : 400;

      return res.status(statusCode).json({ message: error.message });
    }
  });

  uploadAvatar = asyncHandler(async (req, res) => {
    try {
      const user = await userService.uploadAvatar(req.user.id, req.file);

      return res.status(200).json({
        message: "Upload avatar thành công",
        user,
      });
    } catch (error) {
      return res.status(400).json({ message: error.message });
    }
  });

  forgotPassword = asyncHandler(async (req, res) => {
    try {
      await authService.forgotPassword(req.body.email);

      return res.status(200).json({
        message:
          "Email đặt lại mật khẩu đã được gửi. Vui lòng kiểm tra hộp thư.",
      });
    } catch (error) {
      const statusCode = error.message.includes("không tồn tại") ? 404 : 500;

      return res.status(statusCode).json({ message: error.message });
    }
  });

  resetPassword = asyncHandler(async (req, res) => {
    try {
      await authService.resetPassword(req.body.token, req.body.newPassword);

      return res.status(200).json({
        message: "Mật khẩu đã được đặt lại thành công",
      });
    } catch (error) {
      return res.status(400).json({ message: error.message });
    }
  });

  refreshToken = asyncHandler(async (req, res) => {
    try {
      const tokens = await authService.refreshToken(req.cookies.refreshToken);

      authService.setCookies(res, tokens.refreshToken, tokens.accessToken);

      return res.status(200).json({ message: "Đã làm mới token thành công" });
    } catch (error) {
      const statusCode = error.message.includes("chưa đăng nhập") ? 401 : 403;

      return res.status(statusCode).json({ message: error.message });
    }
  });
}

export default new UserController();
