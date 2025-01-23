import config from "../config/index.js";
import nodemailer from "nodemailer";

export async function sendEmailWithAttachment(
  imageBuffer,
  toMail,
  username,
  password,
  businessName = ""
) {
  const transporter = nodemailer.createTransport({
    service: "gmail",
    auth: {
      user: config.smtp_from_email, // Replace with your email
      pass: config.smtp_password, // Replace with your password or app-specific token
    },
  });

  const mailOptions = {
    from: config.smtp_from_email,
    to: toMail, // Replace with recipient's email
    subject: "Here is your Username and password with Business Review Card.",
    text: `Username: ${username}, Password: ${password}`,
    attachments: [
      {
        filename: `${businessName}.png`,
        content: imageBuffer,
        contentType: "image/png",
      },
    ],
  };

  try {
    await transporter.sendMail(mailOptions);
    console.log("Email sent successfully!");
  } catch (error) {
    console.error("Error sending email:", error);
  }
}
