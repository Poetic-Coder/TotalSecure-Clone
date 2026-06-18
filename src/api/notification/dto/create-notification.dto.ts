import { ApiProperty } from '@nestjs/swagger';
import { IsString } from 'class-validator';
export class CreateNotificationDto {
    @ApiProperty({ description: 'Device Fcm Token' })
    @IsString()
    token: string;
    @ApiProperty({ description: 'Data that consists body,title etc' })
    data: any;
}