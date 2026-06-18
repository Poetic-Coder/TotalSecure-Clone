import { ApiHeaders } from '@common/decorators/defaultHeaders';
import { Body, Controller, Post } from '@nestjs/common';
import { ApiBody, ApiProperty, ApiTags } from '@nestjs/swagger';
import { IsEmail, IsPhoneNumber, IsString } from 'class-validator';
import { SmsService } from './services/sms/sms.service';
import { EmailService } from './services/email/email.service';

export class EmailDto {
  @ApiProperty({ description: 'Email recipient' })
  @IsEmail()
  recipient: string;

  @ApiProperty({ description: 'Recipient name' })
  @IsString()
  name: string;

  @ApiProperty({ description: 'OTP' })
  @IsString()
  otp: string;
}

export class SmsDto {
  @ApiProperty({ description: 'Phone number' })
  @IsPhoneNumber('NG')
  recipient: string;

  @ApiProperty({ description: 'OTP' })
  @IsString()
  otp: string;
}

@ApiTags('Communications')
@ApiHeaders()
@Controller('network')
export class NetworkController {
  constructor(
    private readonly emailService: EmailService,
    private readonly smsService: SmsService,
  ) {}

  @Post('send-otp-email')
  @ApiBody({
    description: 'Send email',
    type: EmailDto,
  })
  async sendEmail(@Body() body: EmailDto) {
    await this.emailService.sendOtp(body.recipient, {
      name: body.name,
      otp: body.otp,
    });
    return {
      message: 'Email sent',
    };
  }

  @Post('send-otp-sms')
  @ApiBody({
    description: 'Send sms',
    type: SmsDto,
  })
  async sendSms(@Body() body: SmsDto) {
    return this.smsService.send(body.recipient, `Your OTP is ${body.otp}`);
  }
}
