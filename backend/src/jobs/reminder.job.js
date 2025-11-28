import cron from "node-cron";
import { Op } from "sequelize";
import db from "../models/index.js";
import sendEmail from "../utils/email.util.js";

const startReminderJob = () => {
  cron.schedule("0 * * * *", async () => {
    console.log("Đang quét các công việc sắp hết hạn");

    try {
      const now = new Date();
      const next24Hours = new Date(now.getTime() + 24 * 60 * 60 * 1000);

      const tasks = await db.Task.findAll({
        where: {
          status: { [Op.ne]: "completed" },
          due_date: { [Op.between]: [now, next24Hours] },
        },
        include: [{ model: db.User, attributes: ["full_name", "email"] }],
      });

      if (tasks.length === 0) return;
      console.log(`Tìm thấy ${tasks.length} công việc sắp hết hạn`);
      for (const task of tasks) {
        if (!task.User) continue;

        const message = `Xin chào ${task.User.full_name},
        Công việc của bạn có tiêu đề "${
          task.title
        }" đang đến gần hạn hoàn thành vào ngày ${
          task.due_date.toISOString().split("T")[0]
        }.`;

        await sendEmail({
          email: task.User.email,
          subject: "Nhắc nhở công việc sắp hết hạn",
          message,
        });
      }
    } catch (error) {
      console.error("Lỗi khi gửi email nhắc nhở:", error);
    }
  });
};

export default startReminderJob;
