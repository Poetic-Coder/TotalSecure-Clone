import { Controller, Post, Body } from '@nestjs/common';
import { ApiTags, ApiBody } from '@nestjs/swagger';
import { BusinessAuthService } from './business-auth.service';
import { BusinessLoginDto } from './dtos/login.dto';
import { RegisterClientDto } from './dtos/register-client.dto';
import { VerifyOtpDto } from './dtos/verify-otp.dto';
import { ForgotPasswordDto } from './dtos/forgot-password.dto';
import { ResetPasswordDto } from './dtos/reset-password.dto';

@ApiTags('Business Authentication')
@Controller('business-auth')
export class BusinessAuthController {
  constructor(
    private readonly businessAuthService: BusinessAuthService,
  ) {}

  @Post('login')
  @ApiBody({
    description: 'Login for Client (the business itself)',
    type: BusinessLoginDto,
  })
  async loginClient(@Body() dto: BusinessLoginDto) {
    return this.businessAuthService.loginClient(dto);
  }

  @Post('staff/login')
  @ApiBody({
    description: 'Login for ClientStaff (client portal users)',
    type: BusinessLoginDto,
  })
  async loginClientStaff(@Body() dto: BusinessLoginDto) {
    return this.businessAuthService.loginClientStaff(dto);
  }

  @Post('register')
  @ApiBody({
    description: 'Register a new client (self-signup)',
    type: RegisterClientDto,
  })
  async register(@Body() dto: RegisterClientDto) {
    return this.businessAuthService.registerClient(dto);
  }

@Post('verify')
@ApiBody({
  description: 'Verify email or phone with OTP. Pass either email or phone, not both.',
  type: VerifyOtpDto,
})
async verifyOtp(@Body() dto: VerifyOtpDto) {
  return this.businessAuthService.verifyOtp(dto);
}

  @Post('forgot-password')
  @ApiBody({
    description: 'Request a password reset OTP',
    type: ForgotPasswordDto,
  })
  async forgotPassword(@Body() dto: ForgotPasswordDto) {
    return this.businessAuthService.forgotPassword(dto);
  }

  @Post('reset-password')
  @ApiBody({
    description: 'Reset password using OTP',
    type: ResetPasswordDto,
  })
  async resetPassword(@Body() dto: ResetPasswordDto) {
    return this.businessAuthService.resetPassword(dto);
  }
}