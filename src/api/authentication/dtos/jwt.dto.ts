import { Type } from 'class-transformer';
import { ApiResponseProperty } from '@nestjs/swagger';
import { LoginResponseDto } from './login.dto';

export class JwtDto {
  @ApiResponseProperty({
    type: LoginResponseDto,
  })
  @Type(() => LoginResponseDto)
  userAccount:  Partial<LoginResponseDto>;

  @ApiResponseProperty()
  token: string;

  constructor(partial: Partial<JwtDto>) {
    Object.assign(this, partial);
  }
}
