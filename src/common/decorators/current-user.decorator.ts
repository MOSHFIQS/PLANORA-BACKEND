import { createParamDecorator, ExecutionContext } from "@nestjs/common";
import { IRequestUser } from "../interfaces/request-user.interface";

export const CurrentUser = createParamDecorator(
  (data: keyof IRequestUser | undefined, ctx: ExecutionContext) => {
    const request = ctx.switchToHttp().getRequest();
    const user = request.user || request.session?.user;

    if (!user) return null;

    const formattedUser: IRequestUser = {
      userId: user.id || user.userId,
      id: user.id || user.userId,
      email: user.email,
      role: user.role,
      name: user.name,
      status: user.status,
      needPasswordChange: user.needPasswordChange,
      isDeleted: user.isDeleted,
      emailVerified: user.emailVerified,
    };

    return data ? formattedUser[data] : formattedUser;
  }
);
