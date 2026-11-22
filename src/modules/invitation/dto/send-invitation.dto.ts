import { IsNotEmpty, IsString } from "class-validator";

export class SendInvitationDto {
  @IsString()
  @IsNotEmpty()
  eventId: string;

  @IsString()
  @IsNotEmpty()
  targetUserId: string;
}
