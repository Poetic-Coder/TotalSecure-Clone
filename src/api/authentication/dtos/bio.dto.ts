import { ApiProperty } from '@nestjs/swagger';
import { IsOptional, IsString } from 'class-validator';


export class UpdateBioDto {
  @ApiProperty()
  @IsString()
  firstName: string

  @ApiProperty()
  @IsString()
  lastName: string

  @ApiProperty()
  @IsString()
  username: string

  @ApiProperty({
    required: false
  })
  @IsOptional()
  referralCode?: string

  @ApiProperty({
    required: false
  })
  @IsOptional()
  deviceToken?: string
}
