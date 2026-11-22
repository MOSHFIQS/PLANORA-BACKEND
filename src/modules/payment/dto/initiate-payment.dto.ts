import { ApiPropertyOptional } from "@nestjs/swagger";
import { IsOptional, IsString } from "class-validator";

export class InitiatePaymentDto {
  @ApiPropertyOptional({ description: "Event ID to buy ticket for", example: "evt_12345" })
  @IsString()
  @IsOptional()
  eventId?: string;

  @ApiPropertyOptional({ description: "Invitation ID if paying via invitation", example: "inv_67890" })
  @IsString()
  @IsOptional()
  invitationId?: string;
}
