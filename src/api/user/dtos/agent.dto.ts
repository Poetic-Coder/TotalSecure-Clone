import { ApiProperty } from '@nestjs/swagger';
import { IsBoolean, IsNotEmpty, IsString } from 'class-validator';
import { AgentProfileDto } from './agent-profile.dto';



export class ProfileDto {
  @ApiProperty()
  id: string

  @ApiProperty()
  email: string

  @ApiProperty()
  phone: string

  @ApiProperty()
  agentCode: string

  @ApiProperty({
    type: AgentProfileDto,
  })
  profile: AgentProfileDto

  @ApiProperty()
  @IsBoolean()
  emailVerified: boolean

  @ApiProperty()
  @IsBoolean()
  phoneVerified: boolean
}

export class AgentDto {
  @ApiProperty()
  id: string

  @ApiProperty()
  email: string

  @ApiProperty()
  agentCode: string

  @ApiProperty()
  @IsBoolean()
  emailVerified: boolean
}
