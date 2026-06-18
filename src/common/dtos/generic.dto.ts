import { ApiProperty } from '@nestjs/swagger';

export class MessageResponseDto {
  @ApiProperty({ description: 'Message' })
  message: string;

  constructor(partial: Partial<MessageResponseDto>) {
    Object.assign(this, partial);
  }
}
