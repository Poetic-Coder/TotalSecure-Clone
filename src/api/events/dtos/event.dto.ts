import { ApiProperty } from "@nestjs/swagger";
import { IsBoolean, IsDate, IsNumber, IsObject, IsString, IsUUID } from "class-validator";


export class WebhookEventDto {

  @ApiProperty()
  @IsUUID()
  id: string;

  @ApiProperty()
  @IsString()
  event: string;

  @ApiProperty()
  @IsObject()
  data: any;

  @ApiProperty()
  @IsBoolean()
  success: boolean;

  @ApiProperty()
  @IsDate()
  createdAt: Date;
}