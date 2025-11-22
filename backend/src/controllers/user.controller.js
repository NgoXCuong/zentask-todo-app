import bcrypt from "bcrypt";
import User from "../models/user.model.js";
import {
  asyncHandler,
  createAccessToken,
  createRefreshToken,
} from "../utils/jwt.util.js";

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
    if (!findUser)
      return res
        .status(401)
        .json({ message: "Tài khoản hoặc mật khẩu không chính xác" });

    const isMatchPassword = await bcrypt.compare(
      password,
      findUser.hash_password
    );

    if (!isMatchPassword)
      return res.status(401).json({ message: "Mật khẩu không chính xác " });

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
}

export default new UserController();
