import { ApiProperty } from "@nestjs/swagger";
import { IsNotEmpty, IsUUID } from "class-validator";

export class IdParamDto {
    @ApiProperty()
    @IsUUID()
    @IsNotEmpty()
    id: string;
  }