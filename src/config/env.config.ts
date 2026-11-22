import dotenv from "dotenv";

dotenv.config();

export const envVars = {
  NODE_ENV: process.env.NODE_ENV || "development",
  PORT: process.env.PORT || "5000",
  DATABASE_URL: process.env.DATABASE_URL || "",
  BETTER_AUTH_SECRET: process.env.BETTER_AUTH_SECRET || "better-auth-secret",
  BETTER_AUTH_URL: process.env.BETTER_AUTH_URL || "http://localhost:5000",
  FRONTEND_URL: process.env.FRONTEND_URL || "http://localhost:3000",
  PROD_CLIENT_URL: process.env.PROD_CLIENT_URL || "",
  ACCESS_TOKEN_SECRET: process.env.ACCESS_TOKEN_SECRET || "access_secret",
  REFRESH_TOKEN_SECRET: process.env.REFRESH_TOKEN_SECRET || "refresh_secret",
  ACCESS_TOKEN_EXPIRES_IN: process.env.ACCESS_TOKEN_EXPIRES_IN || "1d",
  REFRESH_TOKEN_EXPIRES_IN: process.env.REFRESH_TOKEN_EXPIRES_IN || "7d",
  BETTER_AUTH_SESSION_TOKEN_EXPIRES_IN: process.env.BETTER_AUTH_SESSION_TOKEN_EXPIRES_IN || "1d",
  BETTER_AUTH_SESSION_TOKEN_UPDATE_AGE: process.env.BETTER_AUTH_SESSION_TOKEN_UPDATE_AGE || "1d",
  GOOGLE_CLIENT_ID: process.env.GOOGLE_CLIENT_ID || "",
  GOOGLE_CLIENT_SECRET: process.env.GOOGLE_CLIENT_SECRET || "",
  GOOGLE_CALLBACK_URL: process.env.GOOGLE_CALLBACK_URL || "",
  STRIPE_SECRET_KEY: process.env.STRIPE_SECRET_KEY || "",
  STRIPE_WEBHOOK_SECRET: process.env.STRIPE_WEBHOOK_SECRET || "",
  CLOUDINARY_CLOUD_NAME: process.env.CLOUDINARY_CLOUD_NAME || "",
  CLOUDINARY_API_KEY: process.env.CLOUDINARY_API_KEY || "",
  CLOUDINARY_API_SECRET: process.env.CLOUDINARY_API_SECRET || "",
  EMAIL_SENDER_SMTP_USER: process.env.EMAIL_SENDER_SMTP_USER || "",
  EMAIL_SENDER_SMTP_PASS: process.env.EMAIL_SENDER_SMTP_PASS || "",
  EMAIL_SENDER_SMTP_HOST: process.env.EMAIL_SENDER_SMTP_HOST || "",
  EMAIL_SENDER_SMTP_PORT: process.env.EMAIL_SENDER_SMTP_PORT || "465",
  EMAIL_SENDER_SMTP_FROM: process.env.EMAIL_SENDER_SMTP_FROM || "",
  SUPER_ADMIN_EMAIL: process.env.SUPER_ADMIN_EMAIL || "admin@planora.com",
  SUPER_ADMIN_PASSWORD: process.env.SUPER_ADMIN_PASSWORD || "Admin123!",
};
