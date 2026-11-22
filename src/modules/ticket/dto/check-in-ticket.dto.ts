import { IsNotEmpty, IsString } from "class-validator";

export class CheckInTicketDto {
  @IsString()
  @IsNotEmpty()
  qrCode: string;
}
