import bcrypt from "bcrypt";
import User from "../models/user.model.js";
import {
  asyncHandler,
  createAccessToken,
  createRefreshToken,
} from "../utils/jwt.util.js";
import jwt from "jsonwebtoken";

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
      { refresh_token: refreshToken },
      { where: { id: findUser.id } }
    );

    setCookies(res, refreshToken, accessToken);

    return res.status(200).json({
      message: "Đăng nhập thành công",
      user: {
        id: findUser.id,
        full_name: findUser.full_name,
        email: findUser.email,
      },
    });
  });

  logout = asyncHandler(async (req, res) => {
    const userId = req.user.id;

    await User.update({ refresh_token: null }, { where: { id: userId } });

    const options = getCookieOptions();
    res.clearCookie("accessToken", options);
    res.clearCookie("refreshToken", options);

    return res.status(200).json({ message: "Đăng xuất thành công" });
  });

  authUser = asyncHandler(async (req, res) => {
    const userId = req.user.id;
    const findUser = await User.findOne({
      where: { id: userId },
      attributes: { exclude: ["hash_password", "refresh_token"] },
    });

    if (!findUser)
      return res.status(404).json({ message: "User không tồn tại" });

    return res
      .status(200)
      .json({ message: "Xác thực thành công", user: findUser });
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
      where: { id: decoded.id, refresh_token: refreshToken },
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
      { refresh_token: newRefreshToken },
      { where: { id: user.id } }
    );

    setCookies(res, newRefreshToken, newAccessToken);

    return res.status(200).json({ message: "Đã làm mới token thành công" });
  });
}

export default new UserController();
