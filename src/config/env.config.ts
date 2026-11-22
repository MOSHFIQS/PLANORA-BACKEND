import dotenv from "dotenv";

dotenv.config();

const cloudinaryUrl = process.env.CLOUDINARY_URL;
let cloudName = process.env.CLOUDINARY_CLOUD_NAME || "";
let apiKey = process.env.CLOUDINARY_API_KEY || "";
let apiSecret = process.env.CLOUDINARY_API_SECRET || "";

if (cloudinaryUrl && (!cloudName || !apiKey || !apiSecret)) {
  try {
    const parsed = new URL(cloudinaryUrl);
    cloudName = parsed.hostname;
    apiKey = parsed.username;
    apiSecret = parsed.password;
  } catch {}
}

const authSecret = process.env.BETTER_AUTH_SECRET || "better-auth-secret-key-planora";

export const envVars = {
  NODE_ENV: process.env.NODE_ENV || "development",
  PORT: process.env.PORT || "5000",
  DATABASE_URL: process.env.DATABASE_URL || "",

  // Authentication
  BETTER_AUTH_SECRET: authSecret,
  BETTER_AUTH_URL: process.env.BETTER_AUTH_URL || "http://localhost:5000",
  FRONTEND_URL: process.env.FRONTEND_URL || process.env.PROD_CLIENT_URL || "http://localhost:3000",
  PROD_CLIENT_URL: process.env.PROD_CLIENT_URL || process.env.FRONTEND_URL || "http://localhost:3000",
  ACCESS_TOKEN_SECRET: process.env.ACCESS_TOKEN_SECRET || authSecret,
  REFRESH_TOKEN_SECRET: process.env.REFRESH_TOKEN_SECRET || authSecret,
  ACCESS_TOKEN_EXPIRES_IN: process.env.ACCESS_TOKEN_EXPIRES_IN || "1d",
  REFRESH_TOKEN_EXPIRES_IN: process.env.REFRESH_TOKEN_EXPIRES_IN || "7d",
  BETTER_AUTH_SESSION_TOKEN_EXPIRES_IN: process.env.BETTER_AUTH_SESSION_TOKEN_EXPIRES_IN || "1d",
  BETTER_AUTH_SESSION_TOKEN_UPDATE_AGE: process.env.BETTER_AUTH_SESSION_TOKEN_UPDATE_AGE || "1d",

  // Google OAuth
  GOOGLE_CLIENT_ID: process.env.GOOGLE_CLIENT_ID || "",
  GOOGLE_CLIENT_SECRET: process.env.GOOGLE_CLIENT_SECRET || "",
  GOOGLE_CALLBACK_URL:
    process.env.GOOGLE_CALLBACK_URL ||
    `${process.env.BETTER_AUTH_URL || "http://localhost:5000"}/api/auth/callback/google`,

  // Stripe
  STRIPE_SECRET_KEY: process.env.STRIPE_SECRET_KEY || "",
  STRIPE_WEBHOOK_SECRET: process.env.STRIPE_WEBHOOK_SECRET || "",

  // Cloudinary
  CLOUDINARY_CLOUD_NAME: cloudName,
  CLOUDINARY_API_KEY: apiKey,
  CLOUDINARY_API_SECRET: apiSecret,

  // SMTP Email
  EMAIL_SENDER_SMTP_USER: process.env.EMAIL_SENDER_SMTP_USER || "",
  EMAIL_SENDER_SMTP_PASS: process.env.EMAIL_SENDER_SMTP_PASS || "",
  EMAIL_SENDER_SMTP_HOST: process.env.EMAIL_SENDER_SMTP_HOST || "smtp.gmail.com",
  EMAIL_SENDER_SMTP_PORT: process.env.EMAIL_SENDER_SMTP_PORT || "465",
  EMAIL_SENDER_SMTP_FROM:
    process.env.EMAIL_SENDER_SMTP_FROM || process.env.EMAIL_SENDER_SMTP_USER || "noreply@planora.com",

  // Initial Super Admin Seeding
  SUPER_ADMIN_EMAIL:
    process.env.SUPER_ADMIN_EMAIL || process.env.ADMIN_EMAIL || "admin@gmail.com",
  SUPER_ADMIN_PASSWORD:
    process.env.SUPER_ADMIN_PASSWORD || process.env.ADMIN_PASSWORD || "12345678",
};
