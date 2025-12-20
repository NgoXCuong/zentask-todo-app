import reteLimit, { rateLimit } from "express-rate-limit";

// 1. Giới hạn chung cho toàn bộ API (An toàn cơ bản)
// Cho phép 100 request trong 15 phút từ 1 IP
export const apiLimiter = rateLimit({
  // windowMs: 15 * 60 * 1000,
  windowMs: 10 * 1000,
  max: 100,
  message: {
    status: 429,
    message: "Bạn đã gửi quá nhiều yêu cầu. Vui lòng thử lại sau 15 phút",
  },
  standardHeaders: true,
  legacyHeaders: false,
});

// 2. Giới hạn nghiêm ngặt cho Auth (Chống Brute Force)
// Chỉ cho phép 5 lần thử đăng nhập sai trong 2 phút
export const authLimit = rateLimit({
  windowMs: 2 * 60 * 1000,
  max: 5,
  message: {
    status: 429,
    message:
      "Bạn đã gửi quá nhiều yêu cầu. Vui lòng đợi 5 phút trước khi thử lại",
  },
  standardHeaders: true,
  legacyHeaders: false,
});
