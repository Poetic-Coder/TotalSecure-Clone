import {
  BadRequestException,
  Body,
  Controller,
  GoneException,
  Post,
  UseGuards,
} from '@nestjs/common';
import {
  ApiBody,
  ApiGoneResponse,
  ApiOperation,
  ApiTags,
} from '@nestjs/swagger';
import { PrismaService } from '@database/prisma.service';
import { AccountType } from '@common/enums';
import { AuthAccountService } from '@api/authentication/services/auth-account.service';
import { AuthRateLimitGuard } from '@api/authentication/guards/auth-rate-limit.guard';
import { AuthRateLimit } from '@api/authentication/decorators/auth-rate-limit.decorator';
import { BusinessLoginDto } from './dtos/login.dto';
import { RegisterClientDto } from './dtos/register-client.dto';
import { ForgotPasswordDto } from './dtos/forgot-password.dto';
import { ResetPasswordDto } from './dtos/reset-password.dto';

@ApiTags('Business Authentication')
@Controller('business-auth')
@UseGuards(AuthRateLimitGuard)
export class BusinessAuthController {
  constructor(
    private readonly accounts: AuthAccountService,
    private readonly prisma: PrismaService,
  ) {}

  @Post('login')
  @AuthRateLimit({ key: 'biz-login', points: 20, durationSec: 60 })
  @ApiOperation({
    summary: 'Deprecated — use POST /auth/login',
    deprecated: true,
  })
  @ApiBody({ type: BusinessLoginDto })
  async loginClient(@Body() dto: BusinessLoginDto) {
    return this.accounts.loginShared(dto.email, dto.password);
  }

  @Post('staff/login')
  @AuthRateLimit({ key: 'biz-staff-login', points: 20, durationSec: 60 })
  @ApiOperation({
    summary: 'Deprecated — use POST /auth/login/client-staff',
    deprecated: true,
  })
  @ApiBody({ type: BusinessLoginDto })
  async loginClientStaff(@Body() dto: BusinessLoginDto) {
    return this.accounts.loginClientStaff(dto.email, dto.password);
  }

  @Post('register')
  @AuthRateLimit({ key: 'biz-register', points: 10, durationSec: 60 })
  @ApiOperation({
    summary:
      'Deprecated — prefer POST /auth/register/client with domain',
    deprecated: true,
  })
  @ApiBody({ type: RegisterClientDto })
  async register(@Body() dto: RegisterClientDto) {
    const company = await this.prisma.company.findUnique({
      where: { id: dto.companyId },
    });
    if (!company) {
      throw new BadRequestException(['Company not found']);
    }
    return this.accounts.registerClient({
      domain: company.domain,
      name: dto.name,
      email: dto.email,
      password: dto.password,
      phone: dto.phone,
      clientType: dto.clientType,
      city: dto.city,
      state: dto.state,
      country: dto.country,
    });
  }

  @Post('verify')
  @ApiOperation({
    summary: 'Removed — use company approval instead',
    deprecated: true,
  })
  @ApiGoneResponse({
    description: 'OTP verify removed. Clients activate via company approval.',
  })
  async verifyOtp() {
    throw new GoneException(
      'OTP verify has been removed. Self-signup clients stay PENDING_APPROVAL until the company approves them at POST /companies/clients/:id/approve.',
    );
  }

  @Post('forgot-password')
  @AuthRateLimit({ key: 'biz-forgot', points: 5, durationSec: 60 })
  @ApiOperation({ deprecated: true, summary: 'Deprecated — use /auth/forgot-password' })
  @ApiBody({ type: ForgotPasswordDto })
  async forgotPassword(@Body() dto: ForgotPasswordDto) {
    if (!dto.email) {
      throw new BadRequestException(['Email is required']);
    }
    return this.accounts.forgotPassword(dto.email, AccountType.CLIENT);
  }

  @Post('reset-password')
  @AuthRateLimit({ key: 'biz-reset', points: 5, durationSec: 60 })
  @ApiOperation({ deprecated: true, summary: 'Deprecated — use /auth/reset-password' })
  @ApiBody({ type: ResetPasswordDto })
  async resetPassword(@Body() dto: ResetPasswordDto) {
    if (!dto.email) {
      throw new BadRequestException(['Email is required']);
    }
    return this.accounts.resetPassword(
      dto.email,
      AccountType.CLIENT,
      dto.otp,
      dto.newPassword,
    );
  }
}
