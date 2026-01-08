import nodemailler from "nodemailer";
import dotenv from "dotenv";
dotenv.config();

const sendEmail = async (optional) => {
  const transporter = nodemailler.createTransport({
    service: "Gmail",
    host: "smtp.gmail.com",
    port: 465,
    secure: true,
    auth: {
      user: process.env.EMAIL_USERNAME,
      pass: process.env.EMAIL_PASSWORD,
    },
  });

  const mailOptions = {
    from: "Zen Task Support<" + process.env.EMAIL_USERNAME + ">",
    to: optional.email,
    subject: optional.subject,
    text: optional.message,
    html: optional.html || null,
  };

  try {
    const info = await transporter.sendMail(mailOptions);
    return info;
  } catch (error) {
    console.error("Error sending email: ", error);
    throw new Error("Không thể gửi email");
  }
};

export default sendEmail;
