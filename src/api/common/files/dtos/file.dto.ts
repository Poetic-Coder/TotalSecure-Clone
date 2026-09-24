import { ApiProperty } from '@nestjs/swagger';
import { IsString } from 'class-validator';

export class UploadDto {
  @ApiProperty()
  @IsString()
  file: string;
}

export class UploadMultipleDto {
  @ApiProperty()
  @IsString({ each: true })
  files: string[];
}
