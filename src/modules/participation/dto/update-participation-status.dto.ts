import { ApiProperty } from "@nestjs/swagger";
import { IsEnum, IsNotEmpty } from "class-validator";
import { ParticipationStatus } from "../../../generated/prisma/enums";

export class UpdateParticipationStatusDto {
  @ApiProperty({
    description: "New participation status",
    enum: ParticipationStatus,
    example: ParticipationStatus.APPROVED,
  })
  @IsEnum(ParticipationStatus)
  @IsNotEmpty()
  status: ParticipationStatus;
}
