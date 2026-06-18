import { ApiProperty } from '@nestjs/swagger';
import { IsBoolean, IsNotEmpty, IsString } from 'class-validator';
import { CustomerProfileDto } from './customer-profile.dto';



export class ProfileDto {
  @ApiProperty()
  id: string

  @ApiProperty()
  email: string

  @ApiProperty()
  phone: string

  
  @ApiProperty({
    type: CustomerProfileDto,
  })    
  profile: CustomerProfileDto

  @ApiProperty()
  @IsBoolean()
  emailVerified: boolean

  @ApiProperty()
  @IsBoolean()
  phoneVerified: boolean
}

export class CustomerDto {
  @ApiProperty()
  id: string

  @ApiProperty()
  email: string

  @ApiProperty()
  @IsBoolean()
  emailVerified: boolean
}
