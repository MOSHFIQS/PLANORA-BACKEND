import {
  Injectable,
  NotFoundException,
  BadRequestException,
  ForbiddenException,
} from "@nestjs/common";
import { PrismaService } from "../../database/prisma.service";
import { AuditService } from "../audit/audit.service";
import { NotificationService } from "../notification/notification.service";
import { auth } from "../auth/auth.config";
import { Role, UserStatus, AuditAction, NotificationType } from "../../generated/prisma/enums";
import { IRequestUser } from "../../common/interfaces/request-user.interface";
import { IQueryParams } from "../../common/interfaces/query.interface";
import { QueryBuilder } from "../../common/utils/query-builder.util";
import { RoleHierarchy } from "../../common/constants/roles.constant";
import { CreateAdminDto } from "./dto/create-admin.dto";

@Injectable()
export class AdminService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly auditService: AuditService,
    private readonly notificationService: NotificationService
  ) {}

  private assertHigherRole(actorRole: Role, targetRole: Role): void {
    if (RoleHierarchy[actorRole] <= RoleHierarchy[targetRole]) {
      throw new ForbiddenException(
        "You do not have permission to perform this action on this user"
      );
    }
  }

  async getAllUsers(user: IRequestUser, query: IQueryParams) {
    const queryBuilder = new QueryBuilder(this.prisma.user, query, {
      searchableFields: ["name", "email"],
      filterableFields: ["role", "status"],
    });

    return queryBuilder
      .search()
      .filter()
      .where({
        role: { in: [Role.USER, Role.ORGANIZER] },
      })
      .sort()
      .paginate()
      .execute();
  }

  async getAllAdmins(user: IRequestUser, query: IQueryParams) {
    const queryBuilder = new QueryBuilder(this.prisma.user, query, {
      searchableFields: ["name", "email"],
      filterableFields: ["role", "status"],
    });

    return queryBuilder
      .search()
      .filter()
      .where({ role: Role.ADMIN })
      .sort()
      .paginate()
      .execute();
  }

  async getSingleUser(id: string) {
    const user = await this.prisma.user.findUnique({ where: { id } });
    if (!user || user.isDeleted) {
      throw new NotFoundException("User not found");
    }
    return user;
  }

  async createAdmin(payload: CreateAdminDto) {
    const data = await auth.api.signUpEmail({
      body: payload,
    });

    if (!data?.user) {
      throw new BadRequestException("Failed to create admin user");
    }

    const updatedAdmin = await this.prisma.user.update({
      where: { id: data.user.id },
      data: {
        needPasswordChange: true,
        emailVerified: true,
      },
    });

    return updatedAdmin;
  }

  async updateUserStatus(targetId: string, newStatus: UserStatus, actor: IRequestUser) {
    if (actor.userId === targetId) {
      throw new BadRequestException("You cannot change your own status");
    }

    const targetUser = await this.prisma.user.findUnique({ where: { id: targetId } });
    if (!targetUser || targetUser.isDeleted) {
      throw new NotFoundException("User not found");
    }

    this.assertHigherRole(actor.role, targetUser.role);

    const updatedUser = await this.prisma.user.update({
      where: { id: targetId },
      data: { status: newStatus },
    });

    await this.auditService.logAction(
      AuditAction.SUSPEND,
      "user",
      targetId,
      actor.userId,
      `Status changed to ${newStatus}`
    );

    await this.notificationService.sendNotification(
      targetId,
      "Account Status Update",
      `Your account status has been changed to ${newStatus}.`,
      newStatus === UserStatus.SUSPENDED ? NotificationType.WARNING : NotificationType.INFO
    );

    return updatedUser;
  }

  async deleteUser(targetId: string, actor: IRequestUser) {
    if (actor.userId === targetId) {
      throw new BadRequestException("You cannot delete yourself");
    }

    const targetUser = await this.prisma.user.findUnique({ where: { id: targetId } });
    if (!targetUser || targetUser.isDeleted) {
      throw new NotFoundException("User not found");
    }

    this.assertHigherRole(actor.role, targetUser.role);

    return this.prisma.user.update({
      where: { id: targetId },
      data: { isDeleted: true, deletedAt: new Date() },
    });
  }

  async updateUserRole(targetId: string, newRole: Role, actor: IRequestUser) {
    if (actor.userId === targetId) {
      throw new BadRequestException("You cannot change your own role");
    }

    const targetUser = await this.prisma.user.findUnique({ where: { id: targetId } });
    if (!targetUser || targetUser.isDeleted) {
      throw new NotFoundException("User not found");
    }

    this.assertHigherRole(actor.role, targetUser.role);

    if (targetUser.role === newRole) {
      throw new BadRequestException("User already has this role");
    }

    const updatedUser = await this.prisma.user.update({
      where: { id: targetId },
      data: { role: newRole },
    });

    await this.auditService.logAction(
      AuditAction.UPDATE,
      "user",
      targetId,
      actor.userId,
      `Role changed from ${targetUser.role} to ${newRole}`
    );

    await this.notificationService.sendNotification(
      targetId,
      "Role Updated",
      `Your role has been updated from ${targetUser.role} to ${newRole}.`,
      NotificationType.INFO
    );

    return updatedUser;
  }
}
