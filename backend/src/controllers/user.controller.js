import bcrypt from "bcrypt";
import User from "../models/user.model.js";
import {
  asyncHandler,
  createAccessToken,
  createRefreshToken,
} from "../utils/jwt.util.js";
import jwt from "jsonwebtoken";
import sendEmail from "../utils/email.util.js";
import crypto from "crypto";
import { Op } from "sequelize";

const DUMMY_HASH = "$2b$10$abcdefghijklmnopqrstuv";

const getCookieOptions = () => {
  const isProduct = process.env.NODE_ENV === "production";
  return {
    httpOnly: true,
    secure: isProduct,
    sameSite: isProduct ? "strict" : "lax",
  };
};

const setCookies = (res, refreshToken, accessToken) => {
  const options = getCookieOptions();

  res.cookie("accessToken", accessToken, {
    ...options,
    maxAge: 30 * 60 * 1000,
  });
  res.cookie("refreshToken", refreshToken, {
    ...options,
    maxAge: 7 * 24 * 60 * 60 * 1000,
  });
};

class UserController {
  register = asyncHandler(async (req, res) => {
    const { full_name, email, password } = req.body;

    const existingEmail = await User.findOne({ where: { email } });
    if (existingEmail)
      return res.status(400).json({ message: "Email đã tồn tại" });

    const hashedPassword = await bcrypt.hash(password, 10);

    const newUser = await User.create({
      full_name,
      email,
      hash_password: hashedPassword,
    });

    // An pass khi tra ve
    const userResponse = newUser.toJSON();
    delete userResponse.hash_password;

    return res
      .status(201)
      .json({ message: "Đăng ký thành công", user: userResponse });
  });

  login = asyncHandler(async (req, res) => {
    const { email, password } = req.body;

    const findUser = await User.findOne({ where: { email: email } });

    // CHỐNG TIMING ATTACK Mục đích: Luôn luôn phải chạy hàm bcrypt.compare() tốn thời gian như nhau.
    // Nếu tìm thấy user -> Lấy hash thật.
    // Nếu KHÔNG thấy -> Lấy dummy hash.
    const targetHash = findUser ? findUser.hash_password : DUMMY_HASH;
    const isMatchPassword = await bcrypt.compare(password, targetHash);

    if (!findUser || !isMatchPassword)
      return res
        .status(401)
        .json({ message: "Tài khoản hoặc mật khẩu không chính xác" });

    const payload = { id: findUser.id, email: findUser.email };
    const accessToken = createAccessToken(payload);
    const refreshToken = createRefreshToken(payload);

    await User.update(
      { refresh_token_hash: refreshToken },
      { where: { id: findUser.id } }
    );

    setCookies(res, refreshToken, accessToken);

    return res.status(200).json({
      message: "Đăng nhập thành công",
      user: {
        id: findUser.id,
        full_name: findUser.full_name,
        email: findUser.email,
        avatar_url: findUser.avatar_url,
      },
    });
  });

  logout = asyncHandler(async (req, res) => {
    const userId = req.user.id;

    await User.update({ refresh_token_hash: null }, { where: { id: userId } });

    const options = getCookieOptions();
    res.clearCookie("accessToken", options);
    res.clearCookie("refreshToken", options);

    return res.status(200).json({ message: "Đăng xuất thành công" });
  });

  authUser = asyncHandler(async (req, res) => {
    // Try JWT auth first
    if (req.user && req.user.id) {
      const userId = req.user.id;
      const findUser = await User.findOne({
        where: { id: userId },
        attributes: { exclude: ["hash_password", "refresh_token_hash"] },
      });

      if (!findUser)
        return res.status(404).json({ message: "User không tồn tại" });

      return res
        .status(200)
        .json({ message: "Xác thực thành công", user: findUser });
    }

    // Try session auth for OAuth users
    if (req.session && req.session.passport && req.session.passport.user) {
      const userId = req.session.passport.user;
      const findUser = await User.findOne({
        where: { id: userId },
        attributes: { exclude: ["hash_password", "refresh_token_hash"] },
      });

      if (!findUser)
        return res.status(404).json({ message: "User không tồn tại" });

      return res
        .status(200)
        .json({ message: "Xác thực thành công", user: findUser });
    }

    return res.status(401).json({ message: "Chưa đăng nhập" });
  });

  updateProfile = asyncHandler(async (req, res) => {
    const userId = req.user.id;
    const { full_name, avatar_url } = req.body;

    const updateData = {};
    if (full_name !== undefined) updateData.full_name = full_name;
    if (avatar_url !== undefined) updateData.avatar_url = avatar_url;

    if (Object.keys(updateData).length === 0) {
      return res.status(400).json({ message: "Không có dữ liệu để cập nhật" });
    }

    const [updatedRows] = await User.update(updateData, {
      where: { id: userId },
    });

    if (updatedRows === 0) {
      return res.status(404).json({ message: "User không tồn tại" });
    }

    // Fetch updated user data
    const updatedUser = await User.findOne({
      where: { id: userId },
      attributes: { exclude: ["hash_password", "refresh_token"] },
    });

    return res.status(200).json({
      message: "Cập nhật profile thành công",
      user: updatedUser,
    });
  });

  uploadAvatar = asyncHandler(async (req, res) => {
    const userId = req.user.id;

    if (!req.file) {
      return res.status(400).json({ message: "Không có file được upload" });
    }

    // Create the avatar URL path
    const avatarUrl = `/uploads/avatars/${req.file.filename}`;

    // Update user's avatar_url
    const [updatedRows] = await User.update(
      { avatar_url: avatarUrl },
      { where: { id: userId } }
    );

    if (updatedRows === 0) {
      return res.status(404).json({ message: "User không tồn tại" });
    }

    // Fetch updated user data
    const updatedUser = await User.findOne({
      where: { id: userId },
      attributes: { exclude: ["hash_password", "refresh_token"] },
    });

    return res.status(200).json({
      message: "Upload avatar thành công",
      user: updatedUser,
    });
  });

  forgotPassword = asyncHandler(async (req, res) => {
    const { email } = req.body;

    const user = await User.findOne({ where: { email } });
    if (!user) {
      return res
        .status(404)
        .json({ message: "Email không tồn tại trong hệ thống" });
    }

    // Generate reset token
    const resetToken = crypto.randomBytes(32).toString("hex");
    const resetTokenExpires = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes

    // Save reset token to database
    await User.update(
      {
        reset_token: resetToken,
        reset_token_expires: resetTokenExpires,
      },
      { where: { id: user.id } }
    );

    // Send email
    const resetUrl = `${
      process.env.FRONTEND_URL || "http://localhost:5173"
    }/reset-password?token=${resetToken}`;

    try {
      await sendEmail({
        email: user.email,
        subject: "Đặt lại mật khẩu ZenTask",
        html: `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
            <h2 style="color: #333;">Đặt lại mật khẩu ZenTask</h2>
            <p>Xin chào ${user.full_name},</p>
            <p>Bạn đã yêu cầu đặt lại mật khẩu cho tài khoản ZenTask.</p>
            <p>Vui lòng nhấp vào liên kết dưới đây để đặt lại mật khẩu:</p>
            <a href="${resetUrl}" style="display: inline-block; padding: 10px 20px; background-color: #007bff; color: white; text-decoration: none; border-radius: 5px;">Đặt lại mật khẩu</a>
            <p>Liên kết này sẽ hết hạn sau 10 phút.</p>
            <p>Nếu bạn không yêu cầu đặt lại mật khẩu, vui lòng bỏ qua email này.</p>
            <br>
            <p>Trân trọng,<br>Đội ngũ ZenTask</p>
          </div>
        `,
      });

      return res.status(200).json({
        message:
          "Email đặt lại mật khẩu đã được gửi. Vui lòng kiểm tra hộp thư.",
      });
    } catch (error) {
      // If email fails, clear the reset token
      await User.update(
        { reset_token: null, reset_token_expires: null },
        { where: { id: user.id } }
      );

      return res
        .status(500)
        .json({ message: "Không thể gửi email. Vui lòng thử lại sau." });
    }
  });

  resetPassword = asyncHandler(async (req, res) => {
    const { token, newPassword } = req.body;

    const user = await User.findOne({
      where: {
        reset_token: token,
        reset_token_expires: { [Op.gt]: new Date() },
      },
    });

    if (!user) {
      return res
        .status(400)
        .json({ message: "Token không hợp lệ hoặc đã hết hạn" });
    }

    // Hash new password
    const hashedPassword = await bcrypt.hash(newPassword, 10);

    // Update password and clear reset token
    await User.update(
      {
        hash_password: hashedPassword,
        reset_token: null,
        reset_token_expires: null,
      },
      { where: { id: user.id } }
    );

    return res
      .status(200)
      .json({ message: "Mật khẩu đã được đặt lại thành công" });
  });

  // Cấp lại access token mới
  refreshToken = asyncHandler(async (req, res) => {
    const refreshToken = req.cookies.refreshToken;

    if (!refreshToken) {
      return res
        .status(401)
        .json({ message: "Bạn chưa đăng nhập (No Refresh Token)" });
    }

    let decoded;
    try {
      decoded = jwt.verify(
        refreshToken,
        process.env.JWT_REFRESH_SECRET || process.env.JWT_SECRET
      );
    } catch (err) {
      return res
        .status(403)
        .json({ message: "Token không hợp lệ hoặc đã hết hạn" });
    }

    const user = await User.findOne({
      where: { id: decoded.id, refresh_token_hash: refreshToken },
    });

    if (!user) {
      return res
        .status(403)
        .json({ message: "Token đã bị thu hồi hoặc không tồn tại" });
    }

    const payload = { id: user.id, email: user.email };
    const newAccessToken = createAccessToken(payload);
    const newRefreshToken = createRefreshToken(payload);

    await User.update(
      { refresh_token_hash: newRefreshToken },
      { where: { id: user.id } }
    );

    setCookies(res, newRefreshToken, newAccessToken);

    return res.status(200).json({ message: "Đã làm mới token thành công" });
  });
}

export default new UserController();
