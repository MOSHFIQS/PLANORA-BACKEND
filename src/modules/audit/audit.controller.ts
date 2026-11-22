import { Controller, Get, Query } from "@nestjs/common";
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
} from "@nestjs/swagger";
import { AuditService } from "./audit.service";
import { Roles } from "../../common/decorators/roles.decorator";
import { Role } from "../../generated/prisma/enums";
import { PaginationQueryDto } from "../../common/dto/pagination-query.dto";

@ApiTags("Audit")
@ApiBearerAuth("bearer")
@Controller("audit")
export class AuditController {
  constructor(private readonly auditService: AuditService) {}

  @Get()
  @Roles(Role.SUPERADMIN)
  @ApiOperation({ summary: "Get system audit logs (SuperAdmin only)" })
  @ApiResponse({ status: 200, description: "Audit logs with pagination returned successfully" })
  async getAllLogs(@Query() query: PaginationQueryDto) {
    return this.auditService.getAllLogs(query);
  }
}
