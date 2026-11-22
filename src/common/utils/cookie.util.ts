import { Request, Response } from "express";

export class CookieUtils {
  static getCookie(req: Request, cookieName: string): string | null {
    const secureName = `__Secure-${cookieName}`;
    if (req.cookies) {
      if (req.cookies[cookieName]) return req.cookies[cookieName];
      if (req.cookies[secureName]) return req.cookies[secureName];
    }

    const cookieHeader = req.headers.cookie;
    if (!cookieHeader) return null;

    const cookies = cookieHeader.split(";").reduce((acc, cookie) => {
      const [key, value] = cookie.trim().split("=");
      if (key && value) {
        acc[key] = decodeURIComponent(value);
      }
      return acc;
    }, {} as Record<string, string>);

    return cookies[cookieName] || cookies[secureName] || null;
  }

  static setCookie(
    res: Response,
    name: string,
    value: string,
    options: any = {}
  ): void {
    res.cookie(name, value, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: process.env.NODE_ENV === "production" ? "none" : "lax",
      path: "/",
      ...options,
    });
  }

  static clearCookie(res: Response, name: string): void {
    res.clearCookie(name, {
      path: "/",
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: process.env.NODE_ENV === "production" ? "none" : "lax",
    });
    // Also clear with sameSite none to ensure clearance
    res.clearCookie(name, {
      path: "/",
      sameSite: "none",
      secure: true,
    });
  }
}
