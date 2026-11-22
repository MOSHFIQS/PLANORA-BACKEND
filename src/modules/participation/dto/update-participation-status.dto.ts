import { IsEnum, IsNotEmpty } from "class-validator";
import { ParticipationStatus } from "../../../generated/prisma/enums";

export class UpdateParticipationStatusDto {
  @IsEnum(ParticipationStatus)
  @IsNotEmpty()
  status: ParticipationStatus;
}
