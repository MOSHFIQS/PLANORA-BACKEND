import { Injectable, OnModuleInit, OnModuleDestroy, Logger } from "@nestjs/common";
import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient } from "../generated/prisma/client";
import { envVars } from "../config/env.config";

@Injectable()
export class PrismaService
  extends PrismaClient
  implements OnModuleInit, OnModuleDestroy
{
  private readonly logger = new Logger(PrismaService.name);

  constructor() {
    const adapter = new PrismaPg({ connectionString: envVars.DATABASE_URL });
    super({ adapter });
  }

  async onModuleInit() {
    try {
      await this.$connect();
      this.logger.log("Prisma connected successfully to PostgreSQL");
    } catch (error) {
      this.logger.error("Failed to connect Prisma to PostgreSQL:", error);
    }
  }

  async onModuleDestroy() {
    await this.$disconnect();
    this.logger.log("Prisma disconnected");
  }
}
