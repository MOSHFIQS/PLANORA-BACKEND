/* eslint-disable @typescript-eslint/no-explicit-any */
import { Injectable, Logger } from "@nestjs/common";
import { PrismaService } from "../../database/prisma.service";
import { AuditAction } from "../../generated/prisma/enums";
import { QueryBuilder } from "../../common/utils/query-builder.util";
import { IQueryParams } from "../../common/interfaces/query.interface";

@Injectable()
export class AuditService {
  private readonly logger = new Logger(AuditService.name);

  constructor(private readonly prisma: PrismaService) {}

  async logAction(
    action: AuditAction,
    entityType: string,
    entityId: string | null = null,
    actorId: string | null = null,
    description: string | null = null,
    metadata: any = null,
    req?: any
  ): Promise<void> {
    try {
      const ipAddress = req?.ip || req?.headers?.["x-forwarded-for"] || null;
      const userAgent = req?.headers?.["user-agent"] || null;

      await this.prisma.auditLog.create({
        data: {
          action,
          entityType,
          entityId,
          description,
          metadata: metadata ? metadata : undefined,
          actorId,
          ipAddress: typeof ipAddress === "string" ? ipAddress : undefined,
          userAgent,
        },
      });
    } catch (error: any) {
      this.logger.error("Failed to log audit action:", error.message);
    }
  }

  async getAllLogs(query: IQueryParams = {}) {
    const qb = new QueryBuilder(this.prisma.auditLog, query, {
      searchableFields: ["entityType", "entityId", "description", "actor.email"],
      filterableFields: ["entityType", "entityId", "actorId", "action"],
    });

    return qb
      .search()
      .filter()
      .include({
        actor: {
          select: {
            id: true,
            name: true,
            email: true,
            role: true,
          },
        },
      })
      .sort()
      .paginate()
      .execute();
  }
}
