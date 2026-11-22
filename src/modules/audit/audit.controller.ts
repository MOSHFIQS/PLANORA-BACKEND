import { Controller, Get, Query, UseGuards } from "@nestjs/common";
import { AuditService } from "./audit.service";
import { Roles } from "../../common/decorators/roles.decorator";
import { Role } from "../../generated/prisma/enums";
import { IQueryParams } from "../../common/interfaces/query.interface";

@Controller("audit")
export class AuditController {
  constructor(private readonly auditService: AuditService) {}

  @Get()
  @Roles(Role.SUPERADMIN)
  async getAllLogs(@Query() query: IQueryParams) {
    return this.auditService.getAllLogs(query);
  }
}
