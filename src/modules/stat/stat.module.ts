import { Module } from "@nestjs/common";
import { StatController } from "./stat.controller";
import { StatService } from "./stat.service";

@Module({
  controllers: [StatController],
  providers: [StatService],
  exports: [StatService],
})
export class StatModule {}
