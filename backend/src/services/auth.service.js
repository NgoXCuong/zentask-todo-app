import bcrypt from "bcrypt";
import User from "../models/user.model.js";
import { createAccessToken, createRefreshToken } from "../utils/jwt.util.js";
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

class AuthService {
  async register(userData) {
    const { full_name, email, password } = userData;

    const existingEmail = await User.findOne({ where: { email } });
    if (existingEmail) {
      throw new Error("Email đã tồn tại");
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const newUser = await User.create({
      full_name,
      email,
      hash_password: hashedPassword,
    });

    // An pass khi tra ve
    const userResponse = newUser.toJSON();
    delete userResponse.hash_password;

    return userResponse;
  }

  async login(credentials) {
    const { email, password } = credentials;

    const findUser = await User.findOne({ where: { email } });

    // CHỐNG TIMING ATTACK Mục đích: Luôn luôn phải chạy hàm bcrypt.compare() tốn thời gian như nhau.
    // Nếu tìm thấy user -> Lấy hash thật.
    // Nếu KHÔNG thấy -> Lấy dummy hash.
    const targetHash = findUser ? findUser.hash_password : DUMMY_HASH;
    const isMatchPassword = await bcrypt.compare(password, targetHash);

    if (!findUser || !isMatchPassword) {
      throw new Error("Tài khoản hoặc mật khẩu không chính xác");
    }

    const payload = {
      id: findUser.id,
      email: findUser.email,
      full_name: findUser.full_name,
    };
    const accessToken = createAccessToken(payload);
    const refreshToken = createRefreshToken(payload);

    await User.update(
      { refresh_token_hash: refreshToken },
      { where: { id: findUser.id } }
    );

    return {
      user: {
        id: findUser.id,
        full_name: findUser.full_name,
        email: findUser.email,
        avatar_url: findUser.avatar_url,
      },
      tokens: { accessToken, refreshToken },
    };
  }

  async logout(userId) {
    await User.update({ refresh_token_hash: null }, { where: { id: userId } });
    return true;
  }

  async authUser(userId) {
    const findUser = await User.findOne({
      where: { id: userId },
      attributes: { exclude: ["hash_password", "refresh_token_hash"] },
    });

    if (!findUser) {
      throw new Error("User không tồn tại");
    }

    return findUser;
  }

  async forgotPassword(email) {
    const user = await User.findOne({ where: { email } });
    if (!user) {
      throw new Error("Email không tồn tại trong hệ thống");
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

      return true;
    } catch (error) {
      // If email fails, clear the reset token
      await User.update(
        { reset_token: null, reset_token_expires: null },
        { where: { id: user.id } }
      );

      throw new Error("Không thể gửi email. Vui lòng thử lại sau.");
    }
  }

  async resetPassword(token, newPassword) {
    const user = await User.findOne({
      where: {
        reset_token: token,
        reset_token_expires: { [Op.gt]: new Date() },
      },
    });

    if (!user) {
      throw new Error("Token không hợp lệ hoặc đã hết hạn");
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

    return true;
  }

  async refreshToken(refreshToken) {
    if (!refreshToken) {
      throw new Error("Bạn chưa đăng nhập (No Refresh Token)");
    }

    let decoded;
    try {
      decoded = jwt.verify(
        refreshToken,
        process.env.JWT_REFRESH_SECRET || process.env.JWT_SECRET
      );
    } catch (err) {
      throw new Error("Token không hợp lệ hoặc đã hết hạn");
    }

    const user = await User.findOne({
      where: { id: decoded.id, refresh_token_hash: refreshToken },
    });

    if (!user) {
      throw new Error("Token đã bị thu hồi hoặc không tồn tại");
    }

    const payload = {
      id: user.id,
      email: user.email,
      full_name: user.full_name,
    };
    const newAccessToken = createAccessToken(payload);
    const newRefreshToken = createRefreshToken(payload);

    await User.update(
      { refresh_token_hash: newRefreshToken },
      { where: { id: user.id } }
    );

    return {
      accessToken: newAccessToken,
      refreshToken: newRefreshToken,
    };
  }

  setCookies(res, refreshToken, accessToken) {
    setCookies(res, refreshToken, accessToken);
  }

  clearCookies(res) {
    const options = getCookieOptions();
    res.clearCookie("accessToken", options);
    res.clearCookie("refreshToken", options);
  }
}

export default new AuthService();
