import cron from "node-cron";
import { Op } from "sequelize";
import db from "../models/index.js";
import sendEmail from "../utils/email.util.js";

const createTaskDeadlineNotifications = async (tasks) => {
  for (const task of tasks) {
    try {
      // Create notification for task creator
      if (task.creator) {
        await db.Notification.create({
          recipient_id: task.creator.id,
          sender_id: null, // System notification
          type: "task_deadline",
          reference_id: task.id,
          reference_type: "task",
          message: `Task "${task.title}" sắp đến hạn vào ${
            task.due_date.toISOString().split("T")[0]
          }`,
          is_read: false,
        });
      }

      // Create notification for task assignee if different from creator
      if (task.assignee && task.assignee.id !== task.creator?.id) {
        await db.Notification.create({
          recipient_id: task.assignee.id,
          sender_id: null, // System notification
          type: "task_deadline",
          reference_id: task.id,
          reference_type: "task",
          message: `Task "${task.title}" sắp đến hạn vào ${
            task.due_date.toISOString().split("T")[0]
          }`,
          is_read: false,
        });
      }

      // Create notifications for workspace members if it's a workspace task
      if (task.workspace_id) {
        const workspaceMembers = await db.WorkspaceMember.findAll({
          where: { workspace_id: task.workspace_id },
        });

        for (const member of workspaceMembers) {
          // Skip if already notified as creator or assignee
          if (
            member.user_id === task.creator?.id ||
            member.user_id === task.assignee?.id
          ) {
            continue;
          }

          await db.Notification.create({
            recipient_id: member.user_id,
            sender_id: null, // System notification
            type: "task_deadline",
            reference_id: task.id,
            reference_type: "task",
            message: `Task "${task.title}" trong workspace sắp đến hạn vào ${
              task.due_date.toISOString().split("T")[0]
            }`,
            is_read: false,
          });
        }
      }
    } catch (error) {
      console.error(
        `Error creating deadline notification for task ${task.id}:`,
        error
      );
    }
  }
};

const startReminderJob = () => {
  cron.schedule("0 * * * *", async () => {
    try {
      const now = new Date();
      const next24Hours = new Date(now.getTime() + 24 * 60 * 60 * 1000);

      const tasks = await db.Task.findAll({
        where: {
          status: { [Op.notIn]: ["completed", "canceled"] },
          due_date: { [Op.between]: [now, next24Hours] },
        },
        include: [
          {
            model: db.User,
            as: "creator",
            attributes: ["id", "full_name", "email"],
          },
          {
            model: db.User,
            as: "assignee",
            attributes: ["id", "full_name", "email"],
          },
        ],
      });

      if (tasks.length === 0) return;
      // Create notifications for all relevant users
      await createTaskDeadlineNotifications(tasks);

      // Send emails as before
      for (const task of tasks) {
        if (!task.creator) continue;

        const message = `Xin chào ${task.creator.full_name},
        Công việc của bạn có tiêu đề "${
          task.title
        }" đang đến gần hạn hoàn thành vào ngày ${
          task.due_date.toISOString().split("T")[0]
        }.`;

        await sendEmail({
          email: task.creator.email,
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
