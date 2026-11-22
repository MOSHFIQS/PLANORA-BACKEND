import { betterAuth } from "better-auth";
import { prismaAdapter } from "better-auth/adapters/prisma";
import { bearer, emailOTP } from "better-auth/plugins";
import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient } from "../../generated/prisma/client";
import { Role, UserStatus } from "../../generated/prisma/enums";
import { envVars } from "../../config/env.config";
import ejs from "ejs";
import nodemailer from "nodemailer";
import path from "path";

const adapter = new PrismaPg({ connectionString: envVars.DATABASE_URL });
export const prisma = new PrismaClient({ adapter });

const transporter = nodemailer.createTransport({
  host: envVars.EMAIL_SENDER_SMTP_HOST,
  port: Number(envVars.EMAIL_SENDER_SMTP_PORT),
  secure: true,
  auth: {
    user: envVars.EMAIL_SENDER_SMTP_USER,
    pass: envVars.EMAIL_SENDER_SMTP_PASS,
  },
});

export const auth = betterAuth({
  baseURL: envVars.BETTER_AUTH_URL,
  secret: envVars.BETTER_AUTH_SECRET,
  database: prismaAdapter(prisma, {
    provider: "postgresql",
  }),

  emailAndPassword: {
    enabled: true,
    requireEmailVerification: true,
  },

  socialProviders: {
    google: {
      clientId: envVars.GOOGLE_CLIENT_ID,
      clientSecret: envVars.GOOGLE_CLIENT_SECRET,
      mapProfileToUser: () => {
        return {
          role: Role.USER,
          status: UserStatus.ACTIVE,
          needPasswordChange: false,
          emailVerified: true,
          isDeleted: false,
          deletedAt: null,
        };
      },
    },
  },

  emailVerification: {
    sendOnSignUp: true,
    sendOnSignIn: true,
    autoSignInAfterVerification: true,
  },

  user: {
    additionalFields: {
      role: {
        type: "string",
        required: true,
        defaultValue: Role.USER,
      },
      status: {
        type: "string",
        required: true,
        defaultValue: UserStatus.ACTIVE,
      },
      needPasswordChange: {
        type: "boolean",
        required: true,
        defaultValue: false,
      },
      isDeleted: {
        type: "boolean",
        required: true,
        defaultValue: false,
      },
      deletedAt: {
        type: "date",
        required: false,
        defaultValue: null,
      },
    },
  },

  plugins: [
    bearer(),
    emailOTP({
      overrideDefaultEmailVerification: true,
      async sendVerificationOTP({ email, otp, type }) {
        const user = await prisma.user.findUnique({
          where: { email },
        });

        if (!user) {
          console.error(`User with email ${email} not found. Cannot send verification OTP.`);
          return;
        }

        if (user.role === Role.SUPERADMIN) {
          console.log(`User ${email} is a super admin. Skipping OTP.`);
          return;
        }

        const subjects: Record<string, string> = {
          "email-verification": "Verify your Planora email",
          "forget-password": "Reset your Planora password",
        };

        if (type === "email-verification" && user.emailVerified) return;

        try {
          const templatePath = path.resolve(process.cwd(), "src/mail/templates/otp.ejs");
          const html = await ejs.renderFile(templatePath, {
            name: user.name,
            otp,
          });

          await transporter.sendMail({
            from: envVars.EMAIL_SENDER_SMTP_FROM,
            to: email,
            subject: subjects[type] || "Authentication OTP",
            html,
          });
        } catch (err: any) {
          console.error("Failed to send OTP email:", err.message);
        }
      },
      expiresIn: 2 * 60, // 2 minutes
      otpLength: 6,
    }),
  ],

  session: {
    expiresIn: 60 * 60 * 24, // 1 day
    updateAge: 60 * 60 * 24,
    cookieCache: {
      enabled: true,
      maxAge: 60 * 60 * 24,
    },
  },

  redirectURLs: {
    signIn: `${envVars.BETTER_AUTH_URL}/api/v1/auth/google/success`,
  },

  trustedOrigins: [envVars.BETTER_AUTH_URL, envVars.FRONTEND_URL],
});
