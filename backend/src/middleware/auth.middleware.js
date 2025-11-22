import { verifyToken } from "../utils/jwt.util.js"; // Import hàm verify từ utils

export const authMiddleware = (req, res, next) => {
  let token;
  if (req.cookies && req.cookies.accessToken) {
    token = req.cookies.accessToken;
  } else if (req.header("Authorization")) {
    const authHeader = req.header("Authorization");
    if (authHeader.startsWith("Bearer ")) {
      token = authHeader.split(" ")[1];
    }
  }

  if (!token) {
    return res
      .status(401)
      .json({ message: "Bạn chưa đăng nhập (Token missing)" });
  }

  const decoded = verifyToken(token); // Hàm này trả về payload (chứa id, email...)
  if (!decoded) {
    return res.status(401).json({ message: "Token không hợp lệ hoặc hết hạn" });
  }

  // 🔥 QUAN TRỌNG: Dòng này giúp controller lấy được id
  req.user = decoded;
  next();
};
