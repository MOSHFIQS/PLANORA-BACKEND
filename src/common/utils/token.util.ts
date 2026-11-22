import { Response } from "express";
import { CookieOptions } from "express";
import { jwtUtils } from "./jwt.util";

const getCookieOptions = (maxAgeMs: number): CookieOptions => {
  const isProduction = process.env.NODE_ENV === "production";
  return {
    httpOnly: true,
    secure: isProduction,
    sameSite: isProduction ? "none" : "lax",
    path: "/",
    maxAge: maxAgeMs,
  };
};

export const tokenUtils = {
  getAccessToken: (payload: Record<string, any>): string => {
    return jwtUtils.generateToken(
      payload,
      process.env.ACCESS_TOKEN_SECRET || "access_secret",
      process.env.ACCESS_TOKEN_EXPIRES_IN || "1d"
    );
  },

  getRefreshToken: (payload: Record<string, any>): string => {
    return jwtUtils.generateToken(
      payload,
      process.env.REFRESH_TOKEN_SECRET || "refresh_secret",
      process.env.REFRESH_TOKEN_EXPIRES_IN || "7d"
    );
  },

  setAccessTokenCookie: (res: Response, token: string): void => {
    res.cookie("accessToken", token, getCookieOptions(24 * 60 * 60 * 1000));
  },

  setRefreshTokenCookie: (res: Response, token: string): void => {
    res.cookie("refreshToken", token, getCookieOptions(7 * 24 * 60 * 60 * 1000));
  },

  setBetterAuthSessionCookie: (res: Response, token?: string): void => {
    if (token) {
      res.cookie("better-auth.session_token", token, getCookieOptions(24 * 60 * 60 * 1000));
    }
  },

  clearAuthCookies: (res: Response): void => {
    const isProduction = process.env.NODE_ENV === "production";
    const clearOpts = {
      path: "/",
      httpOnly: true,
      secure: isProduction,
      sameSite: isProduction ? ("none" as const) : ("lax" as const),
    };
    const clearOptsNone = { path: "/", sameSite: "none" as const, secure: true, httpOnly: true };

    const cookieNames = [
      "accessToken",
      "refreshToken",
      "better-auth.session_token",
      "better-auth.session_data",
      "better-auth.csrf_token",
      "better-auth.state",
      "better-auth.pkce_code_verifier",
    ];

    cookieNames.forEach((name) => {
      res.clearCookie(name, clearOpts);
      res.clearCookie(name, clearOptsNone);
      res.clearCookie(name, { path: "/" });
    });

    // "user" cookie is client-accessible (httpOnly: false)
    res.clearCookie("user", { path: "/" });
    res.clearCookie("user", { path: "/", secure: isProduction, sameSite: isProduction ? "none" : "lax" });
  },
};
