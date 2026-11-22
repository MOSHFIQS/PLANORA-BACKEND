import {
  Injectable,
  CanActivate,
  ExecutionContext,
  ForbiddenException,
  UnauthorizedException,
} from "@nestjs/common";
import { Reflector } from "@nestjs/core";
import { ROLES_KEY } from "../decorators/roles.decorator";
import { IS_PUBLIC_KEY } from "../decorators/public.decorator";
import { Role, UserStatus } from "../../generated/prisma/enums";

@Injectable()
export class RolesGuard implements CanActivate {
  private reflector: Reflector;

  constructor(reflector?: Reflector) {
    this.reflector = reflector || new Reflector();
  }

  canActivate(context: ExecutionContext): boolean {
    const isPublic = this.reflector.getAllAndOverride<boolean>(IS_PUBLIC_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);

    if (isPublic) {
      return true;
    }

    const requiredRoles = this.reflector.getAllAndOverride<Role[]>(ROLES_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);

    const request = context.switchToHttp().getRequest();
    const user = request.user || request.session?.user;

    if (!user) {
      throw new UnauthorizedException("Unauthorized access! Please login.");
    }

    // Standardize userId
    request.user = {
      ...user,
      userId: user.id || user.userId,
    };

    if (user.status === UserStatus.SUSPENDED) {
      throw new UnauthorizedException("Unauthorized access! User is suspended.");
    }

    if (user.isDeleted) {
      throw new UnauthorizedException("Unauthorized access! User is deleted.");
    }

    if (!requiredRoles || requiredRoles.length === 0) {
      return true;
    }

    const hasRole = requiredRoles.includes(user.role);
    if (!hasRole) {
      throw new ForbiddenException(
        "Forbidden access! You do not have permission to access this resource."
      );
    }

    return true;
  }
}
