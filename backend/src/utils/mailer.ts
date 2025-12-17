
import nodemailer from "nodemailer";
import dotenv from "dotenv";

dotenv.config();

// Production-ready SMTP Configuration
export const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST || "smtp.gmail.com",
  port: parseInt(process.env.SMTP_PORT || "587"),
  secure: process.env.SMTP_SECURE === "true", // true for 465, false for other ports
  auth: {
    user: process.env.SMTP_USER || process.env.EMAIL_USER, // Support both var names
    pass: process.env.SMTP_PASS || process.env.EMAIL_PASS,
  },
});
