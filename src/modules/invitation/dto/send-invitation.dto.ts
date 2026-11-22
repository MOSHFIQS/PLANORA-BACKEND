import { ApiProperty } from "@nestjs/swagger";
import { IsNotEmpty, IsString } from "class-validator";

export class SendInvitationDto {
  @ApiProperty({ description: "Event ID to invite guest to", example: "evt_12345" })
  @IsString()
  @IsNotEmpty()
  eventId: string;

  @ApiProperty({ description: "User ID of the guest or speaker to invite", example: "usr_67890" })
  @IsString()
  @IsNotEmpty()
  targetUserId: string;
}
