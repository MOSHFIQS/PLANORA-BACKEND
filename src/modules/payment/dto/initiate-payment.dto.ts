import { IsOptional, IsString } from "class-validator";

export class InitiatePaymentDto {
  @IsString()
  @IsOptional()
  eventId?: string;

  @IsString()
  @IsOptional()
  invitationId?: string;
}
