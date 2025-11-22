import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import cookieParser from "cookie-parser";

import sequelize from "./config/db.js";
import taskRoutes from "./routes/task.routes.js";
import userRoutes from "./routes/user.routes.js";
import "./models/index.js";

dotenv.config();

const PORT = process.env.PORT || 3000;
const app = express();
app.use(
  cors({
    origin: ["http://localhost:5173", "http://127.0.0.1:5173"],

    credentials: true, // Bắt buộc để nhận Cookie
    methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization"],
  })
);
app.use(express.json());
app.use(cookieParser());

async function startServer() {
  try {
    console.log("Đang đồng bộ hóa cơ sở dữ liệu...");
    await sequelize.sync({ alter: true });
    console.log("Cơ sở dữ liệu đã được đồng bộ hóa thành công.");

    app.use("/api/tasks", taskRoutes);
    app.use("/api/users", userRoutes);

    app.get("/", (req, res) => {
      res.send("Zen Task API is running.");
    });

    app.use((err, req, res, next) => {
      console.error("❌ Lỗi:", err.stack); // Log lỗi ra terminal để dev xem

      const statusCode = err.status || 500;
      const message = err.message || "Lỗi Server Nội Bộ";

      return res.status(statusCode).json({
        status: "error",
        message: message,
        // Chỉ hiện chi tiết lỗi khi đang ở môi trường Development
        stack: process.env.NODE_ENV === "development" ? err.stack : undefined,
      });
    });

    app.listen(PORT, () => {
      console.log(`Server chạy tại http://localhost:${PORT}`);
    });
  } catch (error) {
    console.error("Không thể kết nối hoặc đồng bộ hóa cơ sở dữ liệu:", error);
    process.exit(1);
  }
}

startServer();
