import nodemailler from "nodemailer";
import dotenv from "dotenv";
dotenv.config();

const sendEmail = async (optional) => {
  console.log("--- DEBUG EMAIL ---");
  console.log("User:", process.env.EMAIL_USERNAME);
  console.log(
    "Pass (Length):",
    process.env.EMAIL_PASSWORD ? process.env.EMAIL_PASSWORD.length : "Undefined"
  );
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
    console.log("Email sent: " + info.messageId);
    return info;
  } catch (error) {
    console.error("Error sending email: ", error);
    throw new Error("Không thể gửi email");
  }
};

export default sendEmail;
