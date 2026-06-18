import { ApiProperty } from '@nestjs/swagger';
// Firebase messaging service token
export class FmstDto {
  @ApiProperty()
  deviceToken: string
}