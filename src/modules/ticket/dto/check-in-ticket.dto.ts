import { ApiProperty } from "@nestjs/swagger";
import { IsNotEmpty, IsString } from "class-validator";

export class CheckInTicketDto {
  @ApiProperty({ description: "Ticket QR code string / unique hash", example: "TKT-QR-987456321" })
  @IsString()
  @IsNotEmpty()
  qrCode: string;
}
