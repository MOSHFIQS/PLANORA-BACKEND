/* eslint-disable @typescript-eslint/no-explicit-any */
import {
  Injectable,
  NotFoundException,
  BadRequestException,
  UnauthorizedException,
  ForbiddenException,
} from "@nestjs/common";
import { PrismaService } from "../../database/prisma.service";
import { AuditService } from "../audit/audit.service";
import { auth } from "./auth.config";
import { Role, UserStatus, AuditAction } from "../../generated/prisma/enums";
import { tokenUtils } from "../../common/utils/token.util";
import { jwtUtils } from "../../common/utils/jwt.util";
import { envVars } from "../../config/env.config";
import { RegisterDto } from "./dto/register.dto";
import { LoginDto } from "./dto/login.dto";
import { ChangePasswordDto } from "./dto/change-password.dto";

@Injectable()
export class AuthService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly auditService: AuditService
  ) {}

  async registerUser(payload: RegisterDto) {
    const isUserExist = await this.prisma.user.findUnique({
      where: { email: payload.email },
    });

    if (isUserExist) {
      throw new BadRequestException("User already exists with this email");
    }

    const { email, password, name, role } = payload;

    const data = await auth.api.signUpEmail({
      body: {
        email,
        password,
        name,
        role: role || Role.USER,
      },
    });

    if (!data?.user) {
      throw new BadRequestException("Failed to register user");
    }

    await this.auditService.logAction(
      AuditAction.CREATE,
      "user",
      data.user.id,
      data.user.id,
      "User registered"
    );

    const accessToken = tokenUtils.getAccessToken({
      userId: data.user.id,
      role: data.user.role,
      name: data.user.name,
      email: data.user.email,
      status: data.user.status,
      needPasswordChange: data.user.needPasswordChange,
      isDeleted: data.user.isDeleted,
      emailVerified: data.user.emailVerified,
    });

    const refreshToken = tokenUtils.getRefreshToken({
      userId: data.user.id,
      role: data.user.role,
      name: data.user.name,
      email: data.user.email,
      status: data.user.status,
      needPasswordChange: data.user.needPasswordChange,
      isDeleted: data.user.isDeleted,
      emailVerified: data.user.emailVerified,
    });

    return {
      token: data.token,
      accessToken,
      refreshToken,
      user: data.user,
    };
  }

  async loginUser(payload: LoginDto) {
    const user = await this.prisma.user.findUnique({
      where: { email: payload.email },
    });

    if (!user) {
      throw new NotFoundException("User not found");
    }

    if (user.status === UserStatus.SUSPENDED) {
      throw new ForbiddenException("User account is suspended");
    }

    if (user.isDeleted) {
      throw new NotFoundException("User account is deleted");
    }

    const data = await auth.api.signInEmail({
      body: payload,
    });

    if (!data?.user) {
      throw new BadRequestException("Invalid credentials");
    }

    await this.auditService.logAction(
      AuditAction.LOGIN,
      "user",
      user.id,
      user.id,
      "User logged in"
    );

    const accessToken = tokenUtils.getAccessToken({
      userId: data.user.id,
      role: data.user.role,
      name: data.user.name,
      email: data.user.email,
      status: data.user.status,
      needPasswordChange: data.user.needPasswordChange,
      isDeleted: data.user.isDeleted,
      emailVerified: data.user.emailVerified,
    });

    const refreshToken = tokenUtils.getRefreshToken({
      userId: data.user.id,
      role: data.user.role,
      name: data.user.name,
      email: data.user.email,
      status: data.user.status,
      needPasswordChange: data.user.needPasswordChange,
      isDeleted: data.user.isDeleted,
      emailVerified: data.user.emailVerified,
    });

    return {
      token: data.token,
      accessToken,
      refreshToken,
      user: data.user,
    };
  }

  async getNewToken(refreshToken: string, betterAuthSessionToken?: string) {
    if (!refreshToken) {
      throw new UnauthorizedException("Refresh token is missing");
    }

    const verified = jwtUtils.verifyToken(refreshToken, envVars.REFRESH_TOKEN_SECRET);
    if (!verified.success || !verified.data) {
      throw new UnauthorizedException("Invalid refresh token");
    }

    const user = await this.prisma.user.findUnique({
      where: { id: verified.data.userId },
    });

    if (!user) {
      throw new NotFoundException("User not found");
    }

    if (user.status === UserStatus.SUSPENDED) {
      throw new ForbiddenException("User account is suspended");
    }

    if (user.isDeleted) {
      throw new NotFoundException("User account is deleted");
    }

    const newAccessToken = tokenUtils.getAccessToken({
      userId: user.id,
      role: user.role,
      name: user.name,
      email: user.email,
      status: user.status,
      needPasswordChange: user.needPasswordChange,
      isDeleted: user.isDeleted,
      emailVerified: user.emailVerified,
    });

    const newRefreshToken = tokenUtils.getRefreshToken({
      userId: user.id,
      role: user.role,
      name: user.name,
      email: user.email,
      status: user.status,
      needPasswordChange: user.needPasswordChange,
      isDeleted: user.isDeleted,
      emailVerified: user.emailVerified,
    });

    return {
      accessToken: newAccessToken,
      refreshToken: newRefreshToken,
      sessionToken: betterAuthSessionToken,
      user,
    };
  }

  async changePassword(payload: ChangePasswordDto, userId: string) {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
    });

    if (!user) {
      throw new NotFoundException("User not found");
    }

    // Call better-auth changePassword API
    const result = await auth.api.changePassword({
      body: {
        currentPassword: payload.currentPassword,
        newPassword: payload.newPassword,
        revokeOtherSessions: true,
      },
      headers: new Headers(),
    });

    if (user.needPasswordChange) {
      await this.prisma.user.update({
        where: { id: userId },
        data: { needPasswordChange: false },
      });
    }

    await this.auditService.logAction(
      AuditAction.UPDATE,
      "user",
      user.id,
      user.id,
      "Password changed"
    );

    const accessToken = tokenUtils.getAccessToken({
      userId: user.id,
      role: user.role,
      name: user.name,
      email: user.email,
      status: user.status,
      needPasswordChange: false,
      isDeleted: user.isDeleted,
      emailVerified: user.emailVerified,
    });

    const refreshToken = tokenUtils.getRefreshToken({
      userId: user.id,
      role: user.role,
      name: user.name,
      email: user.email,
      status: user.status,
      needPasswordChange: false,
      isDeleted: user.isDeleted,
      emailVerified: user.emailVerified,
    });

    return {
      accessToken,
      refreshToken,
      token: (result as any)?.token || null,
      user,
    };
  }

  async logoutUser(userId: string) {
    await this.prisma.session.deleteMany({
      where: { userId },
    });
  }

  async verifyEmail(email: string, otp: string) {
    const user = await this.prisma.user.findUnique({
      where: { email },
    });

    if (!user) {
      throw new NotFoundException("User not found");
    }

    await auth.api.verifyEmailOTP({
      body: { email, otp },
    });

    await this.prisma.session.deleteMany({
      where: { userId: user.id },
    });
  }

  async forgetPassword(email: string) {
    const user = await this.prisma.user.findUnique({
      where: { email },
    });

    if (!user) {
      throw new NotFoundException("User not found");
    }

    await auth.api.requestPasswordResetEmailOTP({
      body: { email },
    });
  }

  async resetPassword(email: string, otp: string, newPassword: string) {
    const user = await this.prisma.user.findUnique({
      where: { email },
    });

    if (!user) {
      throw new NotFoundException("User not found");
    }

    if (!user.emailVerified) {
      throw new BadRequestException("Email not verified");
    }

    if (user.isDeleted) {
      throw new NotFoundException("User not found");
    }

    await auth.api.resetPasswordEmailOTP({
      body: { email, otp, password: newPassword },
    });

    if (user.needPasswordChange) {
      await this.prisma.user.update({
        where: { id: user.id },
        data: { needPasswordChange: false },
      });
    }

    await this.prisma.session.deleteMany({
      where: { userId: user.id },
    });
  }

  async googleLoginSuccess(session: any) {
    const user = await this.prisma.user.findUnique({
      where: { id: session.user.id },
      include: {
        accounts: {
          select: { providerId: true },
        },
      },
    });

    if (!user) {
      throw new NotFoundException("User not found in system");
    }

    const hasCredentialAccount = user.accounts.some(
      (acc) => acc.providerId === "credential"
    );

    if (!hasCredentialAccount) {
      await this.prisma.session.deleteMany({ where: { userId: user.id } });
      await this.prisma.account.deleteMany({ where: { userId: user.id } });
      await this.prisma.user.delete({ where: { id: user.id } });

      throw new ForbiddenException(
        "No account found for this Google email. Please register with your email and password first, verify your email, then you can sign in with Google."
      );
    }

    if (user.status === UserStatus.SUSPENDED) {
      throw new ForbiddenException("User account is suspended");
    }

    if (user.isDeleted) {
      throw new NotFoundException("User account is deleted");
    }

    await this.auditService.logAction(
      AuditAction.LOGIN,
      "user",
      user.id,
      user.id,
      "User logged in via Google"
    );

    const accessToken = tokenUtils.getAccessToken({
      userId: user.id,
      role: user.role,
      name: user.name,
      email: user.email,
      status: user.status,
      needPasswordChange: user.needPasswordChange,
      isDeleted: user.isDeleted,
      emailVerified: user.emailVerified,
    });

    const refreshToken = tokenUtils.getRefreshToken({
      userId: user.id,
      role: user.role,
      name: user.name,
      email: user.email,
      status: user.status,
      needPasswordChange: user.needPasswordChange,
      isDeleted: user.isDeleted,
      emailVerified: user.emailVerified,
    });

    return {
      accessToken,
      refreshToken,
      user,
    };
  }

  async resendOTP(email: string, type: "email-verification" | "forget-password") {
    if (type === "email-verification") {
      await auth.api.sendVerificationEmail({
        body: { email },
      });
    } else if (type === "forget-password") {
      await auth.api.requestPasswordResetEmailOTP({
        body: { email },
      });
    }
  }
}
