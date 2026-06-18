import { ApiProperty } from '@nestjs/swagger';
import { IsBoolean, IsNotEmpty, IsString } from 'class-validator';
import { StaffProfileDto } from './staff-profile.dto';



export class ProfileDto {
  @ApiProperty()
  id: string

  @ApiProperty()
  email: string

  @ApiProperty()
  phone: string

  @ApiProperty()
  employeeId: string

  @ApiProperty({
    type: StaffProfileDto,
  })
  profile: StaffProfileDto

  @ApiProperty()
  @IsBoolean()
  emailVerified: boolean

  @ApiProperty()
  @IsBoolean()
  phoneVerified: boolean
}

export class StaffDto {
  @ApiProperty()
  id: string

  @ApiProperty()
  email: string

  @ApiProperty()
  employeeId: string

  @ApiProperty()
  @IsBoolean()
  emailVerified: boolean
}
