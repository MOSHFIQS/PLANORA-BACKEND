import {
  Injectable,
  CanActivate,
  ExecutionContext,
  ForbiddenException,
  UnauthorizedException,
} from "@nestjs/common";
import { Reflector } from "@nestjs/core";
import { Request } from "express";
import { ROLES_KEY } from "../decorators/roles.decorator";
import { IS_PUBLIC_KEY } from "../decorators/public.decorator";
import { Role, UserStatus } from "../../generated/prisma/enums";
import { PrismaService } from "../../database/prisma.service";
import { jwtUtils } from "../utils/jwt.util";
import { CookieUtils } from "../utils/cookie.util";
import { envVars } from "../../config/env.config";

@Injectable()
export class RolesGuard implements CanActivate {
  constructor(
    private readonly reflector: Reflector,
    private readonly prisma: PrismaService
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const isPublic = this.reflector.getAllAndOverride<boolean>(IS_PUBLIC_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);

    const request = context.switchToHttp().getRequest<Request & { user?: any; session?: any }>();

    // 1. Check if user was already set on request
    let user = request.user || request.session?.user;

    // 2. If not set, attempt authentication via Bearer token or cookie
    if (!user) {
      // Check Authorization Bearer header
      let token: string | null = null;
      const authHeader = request.headers?.authorization;
      if (authHeader && typeof authHeader === "string" && authHeader.startsWith("Bearer ")) {
        token = authHeader.slice(7).trim();
      }

      // Fallback to accessToken cookie
      if (!token) {
        token = CookieUtils.getCookie(request, "accessToken");
      }

      // Verify JWT token if present
      if (token) {
        const verified = jwtUtils.verifyToken(
          token,
          envVars.ACCESS_TOKEN_SECRET || "accesssecret"
        );
        if (verified.success && verified.data) {
          const payload = verified.data as any;
          user = {
            userId: payload.userId || payload.id,
            id: payload.userId || payload.id,
            role: payload.role,
            email: payload.email,
            name: payload.name,
            status: payload.status,
            needPasswordChange: payload.needPasswordChange,
            isDeleted: payload.isDeleted,
            emailVerified: payload.emailVerified,
          };
        }
      }

      // 3. Fallback to Better Auth session token if JWT not present or invalid
      if (!user) {
        const sessionToken =
          CookieUtils.getCookie(request, "better-auth.session_token") ||
          (request.headers?.["x-session-token"] as string);

        if (sessionToken) {
          const session = await this.prisma.session.findFirst({
            where: {
              token: sessionToken,
              expiresAt: {
                gt: new Date(),
              },
            },
            include: {
              user: true,
            },
          });

          if (session && session.user) {
            const u = session.user;
            user = {
              userId: u.id,
              id: u.id,
              role: u.role,
              email: u.email,
              name: u.name,
              status: u.status,
              needPasswordChange: u.needPasswordChange,
              isDeleted: u.isDeleted,
              emailVerified: u.emailVerified,
            };
          }
        }
      }
    }

    if (user) {
      request.user = {
        ...user,
        userId: user.id || user.userId,
      };
    }

    // Public routes pass through, but if a token was supplied request.user is available
    if (isPublic) {
      return true;
    }

    if (!request.user) {
      throw new UnauthorizedException("Unauthorized access! Please login.");
    }

    const currentUser = request.user;

    if (currentUser.status === UserStatus.SUSPENDED) {
      throw new UnauthorizedException("Unauthorized access! User is suspended.");
    }

    if (currentUser.isDeleted) {
      throw new UnauthorizedException("Unauthorized access! User is deleted.");
    }

    const requiredRoles = this.reflector.getAllAndOverride<Role[]>(ROLES_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);

    if (!requiredRoles || requiredRoles.length === 0) {
      return true;
    }

    const hasRole = requiredRoles.includes(currentUser.role);
    if (!hasRole) {
      throw new ForbiddenException(
        "Forbidden access! You do not have permission to access this resource."
      );
    }

    return true;
  }
}
