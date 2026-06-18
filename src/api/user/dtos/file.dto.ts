import { ApiProperty } from "@nestjs/swagger";
import { IsString, IsUUID } from "class-validator";

export class UploadDto {
  @ApiProperty()
  @IsString()
  file: string
}

export class ImageDto {
  @ApiProperty()
  @IsUUID()
  id: string;

  @ApiProperty()
  @IsString()
  url: string;
}

export class UploadMultipleDto {
  @ApiProperty()
  @IsString({ each: true })
  files: string[];
}
