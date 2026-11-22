/* eslint-disable @typescript-eslint/no-explicit-any */
import {
  Controller,
  Post,
  Get,
  Body,
  Req,
  Res,
  Query,
  HttpStatus,
  HttpCode,
} from "@nestjs/common";
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
  ApiQuery,
} from "@nestjs/swagger";
import { Request, Response } from "express";
import { AuthService } from "./auth.service";
import { Public } from "../../common/decorators/public.decorator";
import { CurrentUser } from "../../common/decorators/current-user.decorator";
import { IRequestUser } from "../../common/interfaces/request-user.interface";
import { tokenUtils } from "../../common/utils/token.util";
import { CookieUtils } from "../../common/utils/cookie.util";
import { envVars } from "../../config/env.config";
import { auth } from "./auth.config";
import { RegisterDto } from "./dto/register.dto";
import { LoginDto } from "./dto/login.dto";
import { ChangePasswordDto } from "./dto/change-password.dto";
import {
  VerifyEmailDto,
  ForgetPasswordDto,
  ResetPasswordDto,
  ResendOtpDto,
} from "./dto/auth-actions.dto";

@ApiTags("Auth")
@Controller("auth")
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Public()
  @Post("register")
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: "Register new user account (Password + OTP verification sent)" })
  @ApiResponse({ status: 201, description: "User registered successfully, verification email sent" })
  @ApiResponse({ status: 400, description: "User with this email already exists" })
  async registerUser(
    @Body() payload: RegisterDto,
    @Res({ passthrough: true }) res: Response
  ) {
    const result = await this.authService.registerUser(payload);
    const { accessToken, refreshToken, token, ...rest } = result;

    tokenUtils.setAccessTokenCookie(res, accessToken);
    tokenUtils.setRefreshTokenCookie(res, refreshToken);
    tokenUtils.setBetterAuthSessionCookie(res, token as string);

    return {
      success: true,
      message: "User registered successfully",
      data: {
        token,
        accessToken,
        refreshToken,
        ...rest,
      },
    };
  }

  @Public()
  @Post("login")
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: "Log in with email and password" })
  @ApiResponse({ status: 200, description: "User logged in successfully; tokens and cookies set" })
  @ApiResponse({ status: 400, description: "Invalid credentials or unverified email" })
  async loginUser(
    @Body() payload: LoginDto,
    @Res({ passthrough: true }) res: Response
  ) {
    const result = await this.authService.loginUser(payload);
    const { accessToken, refreshToken, token, ...rest } = result;

    tokenUtils.setAccessTokenCookie(res, accessToken);
    tokenUtils.setRefreshTokenCookie(res, refreshToken);
    tokenUtils.setBetterAuthSessionCookie(res, token);

    return {
      success: true,
      message: "User logged in successfully",
      data: {
        token,
        accessToken,
        refreshToken,
        ...rest,
      },
    };
  }

  @Public()
  @Post("refresh-token")
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: "Refresh access token using refreshToken cookie / session cookie" })
  @ApiResponse({ status: 200, description: "New access & refresh tokens generated successfully" })
  @ApiResponse({ status: 401, description: "Invalid or expired refresh token" })
  async getNewToken(
    @Req() req: Request,
    @Res({ passthrough: true }) res: Response
  ) {
    const refreshToken = req.cookies?.refreshToken;
    const sessionToken = req.cookies?.["better-auth.session_token"];

    const result = await this.authService.getNewToken(refreshToken, sessionToken);
    const { accessToken, refreshToken: newRefreshToken, user } = result;

    tokenUtils.setAccessTokenCookie(res, accessToken);
    tokenUtils.setRefreshTokenCookie(res, newRefreshToken);
    tokenUtils.setBetterAuthSessionCookie(res, sessionToken);

    res.cookie("user", JSON.stringify(user), {
      expires: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
      path: "/",
    });

    return {
      success: true,
      message: "New tokens generated successfully",
      data: {
        accessToken,
        refreshToken: newRefreshToken,
        sessionToken,
        user,
      },
    };
  }

  @Public()
  @Get("login/google")
  @ApiOperation({ summary: "Initiate Google OAuth2 social login" })
  @ApiQuery({ name: "redirect", required: false, description: "Destination redirect route after OAuth", example: "/dashboard" })
  @ApiQuery({ name: "role", required: false, description: "User role to assign upon creation", example: "USER" })
  @ApiResponse({ status: 200, description: "Renders Google OAuth authorization redirect page" })
  googleLogin(
    @Query("redirect") redirect: string = "/dashboard",
    @Query("role") role: string = "USER",
    @Res() res: Response
  ) {
    const encodedRedirect = encodeURIComponent(redirect);
    const encodedRole = encodeURIComponent(role);
    const callbackURL = `${envVars.BETTER_AUTH_URL}/api/v1/auth/google/success?redirect=${encodedRedirect}&role=${encodedRole}`;

    return res.render("googleRedirect", {
      callbackURL,
      betterAuthUrl: envVars.BETTER_AUTH_URL,
    });
  }

  @Public()
  @Get("google/success")
  @ApiOperation({ summary: "Google OAuth callback handler" })
  @ApiQuery({ name: "redirect", required: false, example: "/dashboard" })
  @ApiResponse({ status: 302, description: "Redirects user back to frontend client" })
  async googleLoginSuccess(
    @Req() req: Request,
    @Res() res: Response,
    @Query("redirect") redirect: string = "/dashboard"
  ) {
    try {
      const headers = new Headers();
      if (req.headers.cookie) {
        headers.set("cookie", req.headers.cookie);
      }
      if (req.headers["user-agent"]) {
        headers.set("user-agent", req.headers["user-agent"] as string);
      }

      // Check session token with both standard and HTTPS __Secure- prefix
      const sessionToken = CookieUtils.getCookie(req, "better-auth.session_token");
      if (sessionToken && !headers.get("cookie")?.includes("session_token")) {
        headers.set("cookie", `better-auth.session_token=${sessionToken}; __Secure-better-auth.session_token=${sessionToken}`);
      }

      let session = await auth.api.getSession({ headers });

      // Fallback: check session directly in DB
      if (!session && sessionToken) {
        const dbSession = await this.authService.findSessionByToken(sessionToken);
        if (dbSession && dbSession.user) {
          session = {
            session: dbSession,
            user: dbSession.user,
          } as any;
        }
      }

      if (!session) {
        return res.redirect(
          `${envVars.FRONTEND_URL}/login?error=${encodeURIComponent("google_session_not_found")}`
        );
      }

      const result = await this.authService.googleLoginSuccess(session);
      const { accessToken, refreshToken, user } = result;

      tokenUtils.setAccessTokenCookie(res, accessToken);
      tokenUtils.setRefreshTokenCookie(res, refreshToken);
      tokenUtils.setBetterAuthSessionCookie(res, session.session.token);

      res.cookie("user", JSON.stringify(user), {
        expires: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
        path: "/",
        secure: process.env.NODE_ENV === "production",
        sameSite: process.env.NODE_ENV === "production" ? "none" : "lax",
      });

      const isValidRedirect = redirect.startsWith("/") && !redirect.startsWith("//");
      const finalRedirect = isValidRedirect ? redirect : "/dashboard";

      // Redirect to frontend login handler with tokens so cross-domain Vercel frontend gets cookies set properly
      const redirectUrl = new URL(`${envVars.FRONTEND_URL}/login`);
      redirectUrl.searchParams.set("google_login", "success");
      redirectUrl.searchParams.set("accessToken", accessToken);
      redirectUrl.searchParams.set("refreshToken", refreshToken);
      redirectUrl.searchParams.set("sessionToken", session.session.token);
      redirectUrl.searchParams.set("redirect", finalRedirect);

      return res.redirect(redirectUrl.toString());
    } catch (error: any) {
      return res.redirect(
        `${envVars.FRONTEND_URL}/login?error=${encodeURIComponent(error.message || "oauth_failed")}`
      );
    }
  }

  @Public()
  @Get("oauth/error")
  @ApiOperation({ summary: "Google OAuth error fallback handler" })
  @ApiQuery({ name: "error", required: false, example: "oauth_failed" })
  handleOAuthError(
    @Query("error") error: string = "oauth_failed",
    @Res() res: Response
  ) {
    return res.redirect(`${envVars.FRONTEND_URL}/login?error=${encodeURIComponent(error)}`);
  }

  @Post("change-password")
  @ApiBearerAuth("bearer")
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: "Change account password for authenticated user" })
  @ApiResponse({ status: 200, description: "Password updated successfully" })
  @ApiResponse({ status: 400, description: "Current password incorrect" })
  async changePassword(
    @Body() payload: ChangePasswordDto,
    @CurrentUser() user: IRequestUser,
    @Res({ passthrough: true }) res: Response
  ) {
    const result = await this.authService.changePassword(payload, user.userId);
    const { accessToken, refreshToken, token } = result;

    tokenUtils.setAccessTokenCookie(res, accessToken);
    tokenUtils.setRefreshTokenCookie(res, refreshToken);
    tokenUtils.setBetterAuthSessionCookie(res, token as string);

    return {
      success: true,
      message: "Password changed successfully",
      data: result,
    };
  }

  @Public()
  @Post("logout")
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: "Log out user & clear session cookies" })
  @ApiResponse({ status: 200, description: "User logged out successfully" })
  async logoutUser(
    @CurrentUser() user: IRequestUser,
    @Res({ passthrough: true }) res: Response
  ) {
    try {
      if (user?.userId) {
        await this.authService.logoutUser(user.userId);
      }
    } catch {
      // Ignore
    }

    tokenUtils.clearAuthCookies(res);

    return {
      success: true,
      message: "User logged out successfully",
    };
  }

  @Public()
  @Post("verify-email")
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: "Verify email with 6-digit OTP" })
  @ApiResponse({ status: 200, description: "Email verified successfully" })
  @ApiResponse({ status: 400, description: "Invalid or expired OTP" })
  async verifyEmail(@Body() payload: VerifyEmailDto) {
    await this.authService.verifyEmail(payload.email, payload.otp);
    return {
      success: true,
      message: "Email verified successfully",
    };
  }

  @Public()
  @Post("forget-password")
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: "Request password reset OTP to email" })
  @ApiResponse({ status: 200, description: "OTP sent to email successfully" })
  async forgetPassword(@Body() payload: ForgetPasswordDto) {
    await this.authService.forgetPassword(payload.email);
    return {
      success: true,
      message: "OTP sent to your email for password reset",
    };
  }

  @Public()
  @Post("reset-password")
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: "Reset password using OTP code" })
  @ApiResponse({ status: 200, description: "Password reset successfully" })
  @ApiResponse({ status: 400, description: "Invalid OTP or user not found" })
  async resetPassword(@Body() payload: ResetPasswordDto) {
    await this.authService.resetPassword(
      payload.email,
      payload.otp,
      payload.newPassword
    );
    return {
      success: true,
      message: "Password reset successfully",
    };
  }

  @Public()
  @Post("resend-otp")
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: "Resend verification or password reset OTP" })
  @ApiResponse({ status: 200, description: "OTP resent successfully" })
  async resendOTP(@Body() payload: ResendOtpDto) {
    await this.authService.resendOTP(payload.email, payload.type);
    return {
      success: true,
      message: "OTP resent successfully",
    };
  }
}
