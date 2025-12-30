import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import cookieParser from "cookie-parser";
import session from "express-session";

import { apiLimiter } from "./middleware/limiter.middleware.js";
import sequelize from "./config/db.js";
import routes from "./routes/index.routes.js";
import "./models/index.js";
import passport from "./config/passport.js";
import startReminderJob from "./jobs/reminder.job.js";

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

// Session middleware for Passport
app.use(
  session({
    secret: process.env.SESSION_SECRET || "your-session-secret",
    resave: false,
    saveUninitialized: false,
    cookie: {
      secure: process.env.NODE_ENV === "production",
      maxAge: 24 * 60 * 60 * 1000, // 24 hours
    },
  })
);

// Passport middleware
app.use(passport.initialize());
app.use(passport.session());

// Serve static files from uploads directory
app.use("/uploads", express.static("uploads"));

async function startServer() {
  try {
    console.log("Đang đồng bộ hóa cơ sở dữ liệu...");
    await sequelize.sync({ alter: true }); // Tắt auto-sync
    console.log("Cơ sở dữ liệu đã được đồng bộ hóa thành công.");

    app.use("/api", apiLimiter);

    // Apply all routes from centralized configuration
    routes.forEach(({ path, router }) => {
      app.use(path, router);
    });

    app.get("/", (req, res) => {
      res.send("Zen Task API is running.");
    });

    app.use((err, req, res, next) => {
      console.error("❌ Lỗi:", err.stack);

      const statusCode = err.status || 500;
      const message = err.message || "Lỗi Server Nội Bộ";

      return res.status(statusCode).json({
        status: "error",
        message: message,
        // Chỉ hiện chi tiết lỗi khi đang ở môi trường Development
        stack: process.env.NODE_ENV === "development" ? err.stack : undefined,
      });
    });

    startReminderJob();
    app.listen(PORT, () => {
      console.log(`Server chạy tại http://localhost:${PORT}`);
    });
  } catch (error) {
    console.error("Không thể kết nối hoặc đồng bộ hóa cơ sở dữ liệu:", error);
    process.exit(1);
  }
}

startServer();
