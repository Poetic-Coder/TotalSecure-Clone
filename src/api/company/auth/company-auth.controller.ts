import {
  Body,
  Controller,
  Get,
  Post,
  Query,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import {
  ApiBadRequestResponse,
  ApiBearerAuth,
  ApiBody,
  ApiOkResponse,
  ApiOperation,
  ApiQuery,
  ApiTags,
  ApiTooManyRequestsResponse,
  ApiUnauthorizedResponse,
} from '@nestjs/swagger';
import { AuthUserInterceptor } from '@api/common/auth/interceptors/authenticated-account.interceptor';
import { AuthRateLimit } from '@api/common/auth/decorators/auth-rate-limit.decorator';
import { AuthRateLimitGuard } from '@api/common/auth/guards/auth-rate-limit.guard';
import {
  AuthSessionResponseDto,
  ForgotPasswordDto,
  MessageResponseDto,
  PasswordConfirmDto,
  RefreshTokenDto,
  RegisterCompanyDto,
  ResetPasswordDto,
  SharedLoginDto,
  VerifyMfaDto,
} from '@api/common/auth/dtos/unified-auth.dto';
import { AuthAccountService } from '@api/common/auth/services/auth-account.service';
import { AuthSessionService } from '@api/common/auth/services/auth-session.service';
import { CurrentUser } from '@common/decorators/current-user';
import { AuthenticatedRequestUser } from '@common/interfaces';

@ApiTags('Company Auth')
@Controller('company/auth')
@UseGuards(AuthRateLimitGuard)
@ApiTooManyRequestsResponse({ description: 'IP rate limit exceeded' })
export class CompanyAuthController {
  constructor(
    private readonly accounts: AuthAccountService,
    private readonly session: AuthSessionService,
  ) {}

  @Post('login')
  @AuthRateLimit({ key: 'company-login', points: 20, durationSec: 60 })
  @ApiOperation({
    summary: 'Company portal login',
    description:
      'Public. Accepts Company account or company Staff (email unique across both).',
  })
  @ApiBody({ type: SharedLoginDto })
  @ApiOkResponse({ type: AuthSessionResponseDto })
  @ApiBadRequestResponse({ description: 'Invalid credentials or blocked' })
  login(@Body() dto: SharedLoginDto) {
    return this.accounts.loginCompanyPortal(dto.email, dto.password);
  }

  @Post('guard/login')
  @AuthRateLimit({ key: 'company-guard-login', points: 20, durationSec: 60 })
  @ApiOperation({ summary: 'Guard mobile app login' })
  @ApiBody({ type: SharedLoginDto })
  @ApiOkResponse({ type: AuthSessionResponseDto })
  loginGuard(@Body() dto: SharedLoginDto) {
    return this.accounts.loginGuard(dto.email, dto.password);
  }

  @Post('register')
  @AuthRateLimit({ key: 'company-register', points: 5, durationSec: 60 })
  @ApiOperation({
    summary: 'Register a security company',
    description:
      'Public. Creates company with status PENDING_APPROVAL. domain must be unique.',
  })
  @ApiBody({ type: RegisterCompanyDto })
  register(@Body() dto: RegisterCompanyDto) {
    return this.accounts.registerCompany(dto);
  }

  @Get('branding')
  @AuthRateLimit({ key: 'company-branding', points: 60, durationSec: 60 })
  @ApiOperation({
    summary: 'Public white-label branding',
    description: 'Lookup by company domain for branded registration/login screens.',
  })
  @ApiQuery({ name: 'domain', required: true, example: 'acme.guards.ng' })
  getBranding(@Query('domain') domain: string) {
    return this.accounts.getBranding(domain);
  }

  @Post('refresh')
  @AuthRateLimit({ key: 'company-refresh', points: 30, durationSec: 60 })
  @ApiOperation({ summary: 'Rotate refresh token' })
  @ApiBody({ type: RefreshTokenDto })
  @ApiOkResponse({ type: AuthSessionResponseDto })
  @ApiUnauthorizedResponse({ description: 'Invalid or expired refresh token' })
  refresh(@Body() dto: RefreshTokenDto) {
    return this.session.refresh(dto.refreshToken);
  }

  @Post('logout')
  @ApiOperation({ summary: 'Revoke a refresh token' })
  @ApiBody({ type: RefreshTokenDto })
  @ApiOkResponse({ type: MessageResponseDto })
  logout(@Body() dto: RefreshTokenDto) {
    return this.session.logout(dto.refreshToken);
  }

  @Get('me')
  @ApiBearerAuth('bearer')
  @UseInterceptors(AuthUserInterceptor)
  @ApiOperation({ summary: 'Current company / staff account' })
  me(@CurrentUser() user: AuthenticatedRequestUser) {
    return this.session.stripSecret(user as unknown as Record<string, unknown>);
  }

  @Post('forgot-password')
  @AuthRateLimit({ key: 'company-forgot-password', points: 5, durationSec: 60 })
  @ApiOperation({
    summary: 'Request password-reset OTP',
    description: 'accountType must be COMPANY or STAFF.',
  })
  @ApiBody({ type: ForgotPasswordDto })
  @ApiOkResponse({ type: MessageResponseDto })
  forgotPassword(@Body() dto: ForgotPasswordDto) {
    return this.accounts.forgotPassword(dto.email, dto.accountType);
  }

  @Post('reset-password')
  @AuthRateLimit({ key: 'company-reset-password', points: 5, durationSec: 60 })
  @ApiOperation({ summary: 'Reset password with OTP' })
  @ApiBody({ type: ResetPasswordDto })
  @ApiOkResponse({ type: MessageResponseDto })
  resetPassword(@Body() dto: ResetPasswordDto) {
    return this.accounts.resetPassword(
      dto.email,
      dto.accountType,
      dto.otp,
      dto.password,
    );
  }

  @Post('mfa/verify')
  @AuthRateLimit({ key: 'company-mfa-verify', points: 10, durationSec: 60 })
  @ApiOperation({ summary: 'Complete MFA challenge' })
  @ApiBody({ type: VerifyMfaDto })
  @ApiOkResponse({ type: AuthSessionResponseDto })
  verifyMfa(@Body() dto: VerifyMfaDto) {
    return this.accounts.verifyMfa(dto.mfaToken, dto.otp);
  }

  @Post('mfa/enable')
  @ApiBearerAuth('bearer')
  @UseInterceptors(AuthUserInterceptor)
  @ApiOperation({ summary: 'Enable email MFA' })
  @ApiBody({ type: PasswordConfirmDto })
  @ApiOkResponse({ type: MessageResponseDto })
  enableMfa(
    @CurrentUser() user: AuthenticatedRequestUser,
    @Body() dto: PasswordConfirmDto,
  ) {
    return this.accounts.enableMfa(user, dto.password);
  }

  @Post('mfa/disable')
  @ApiBearerAuth('bearer')
  @UseInterceptors(AuthUserInterceptor)
  @ApiOperation({ summary: 'Disable email MFA' })
  @ApiBody({ type: PasswordConfirmDto })
  @ApiOkResponse({ type: MessageResponseDto })
  disableMfa(
    @CurrentUser() user: AuthenticatedRequestUser,
    @Body() dto: PasswordConfirmDto,
  ) {
    return this.accounts.disableMfa(user, dto.password);
  }
}
