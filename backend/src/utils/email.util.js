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
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASS,
    },
  });

  const mailOptions = {
    from: "Zen Task Support<" + process.env.EMAIL_USER + ">",
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
