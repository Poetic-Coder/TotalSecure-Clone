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
  ApiBearerAuth,
  ApiBody,
  ApiOkResponse,
  ApiOperation,
  ApiQuery,
  ApiTags,
  ApiUnauthorizedResponse,
  ApiTooManyRequestsResponse,
  ApiBadRequestResponse,
} from '@nestjs/swagger';
import { AuthUserInterceptor } from '@common/interceptors/authenticated-account.interceptor';
import { CurrentUser } from '@common/decorators/current-user';
import { AuthenticatedRequestUser } from '@common/interfaces';
import { AuthAccountService } from '../services/auth-account.service';
import { AuthSessionService } from '../services/auth-session.service';
import { AuthRateLimitGuard } from '../guards/auth-rate-limit.guard';
import { AuthRateLimit } from '../decorators/auth-rate-limit.decorator';
import {
  AuthSessionResponseDto,
  EmailPasswordDto,
  ForgotPasswordDto,
  MessageResponseDto,
  PasswordConfirmDto,
  RefreshTokenDto,
  RegisterClientDto,
  RegisterCompanyDto,
  ResetPasswordDto,
  SharedLoginDto,
  PlatformLoginDto,
  VerifyMfaDto,
} from '../dtos/unified-auth.dto';

@ApiTags('Authentication')
@Controller('auth')
@UseGuards(AuthRateLimitGuard)
@ApiTooManyRequestsResponse({ description: 'IP rate limit exceeded' })
export class AuthSessionController {
  constructor(
    private readonly accounts: AuthAccountService,
    private readonly session: AuthSessionService,
  ) {}

  @Post('login')
  @AuthRateLimit({ key: 'login', points: 20, durationSec: 60 })
  @ApiOperation({
    summary: 'Shared login (Company, Client, or Staff)',
    description:
      'Public. No x-api-key. Body is email + password only — the account type is resolved from the email. Pending/suspended accounts cannot log in. If MFA is enabled, returns mfaRequired + mfaToken instead of a session.',
  })
  @ApiBody({ type: SharedLoginDto })
  @ApiOkResponse({ type: AuthSessionResponseDto })
  @ApiBadRequestResponse({ description: 'Invalid credentials or blocked' })
  login(@Body() dto: SharedLoginDto) {
    return this.accounts.loginShared(dto.email, dto.password);
  }

  @Post('platform/login')
  @AuthRateLimit({ key: 'platform-login', points: 20, durationSec: 60 })
  @ApiOperation({
    summary: 'Platform staff login',
    description: 'Public. Separate from company/client/staff login.',
  })
  @ApiBody({ type: PlatformLoginDto })
  @ApiOkResponse({ type: AuthSessionResponseDto })
  loginPlatform(@Body() dto: PlatformLoginDto) {
    return this.accounts.loginPlatform(dto.email, dto.password);
  }

  @Post('login/guard')
  @AuthRateLimit({ key: 'login-guard', points: 20, durationSec: 60 })
  @ApiOperation({ summary: 'Guard mobile app login' })
  @ApiBody({ type: EmailPasswordDto })
  @ApiOkResponse({ type: AuthSessionResponseDto })
  loginGuard(@Body() dto: EmailPasswordDto) {
    return this.accounts.loginGuard(dto.email, dto.password);
  }

  @Post('login/client-staff')
  @AuthRateLimit({ key: 'login-client-staff', points: 20, durationSec: 60 })
  @ApiOperation({ summary: 'Client portal user (ClientStaff) login' })
  @ApiBody({ type: EmailPasswordDto })
  @ApiOkResponse({ type: AuthSessionResponseDto })
  loginClientStaff(@Body() dto: EmailPasswordDto) {
    return this.accounts.loginClientStaff(dto.email, dto.password);
  }

  @Post('register/company')
  @AuthRateLimit({ key: 'register-company', points: 5, durationSec: 60 })
  @ApiOperation({
    summary: 'Register a security company',
    description:
      'Public. Creates company with status PENDING_APPROVAL. domain must be unique (white-label host). Cannot log in until platform approves.',
  })
  @ApiBody({ type: RegisterCompanyDto })
  registerCompany(@Body() dto: RegisterCompanyDto) {
    return this.accounts.registerCompany(dto);
  }

  @Post('register/client')
  @AuthRateLimit({ key: 'register-client', points: 10, durationSec: 60 })
  @ApiOperation({
    summary: 'Client self-signup via white-label domain',
    description:
      'Public. Pass company domain (e.g. acme.guards.ng), not companyId. Status PENDING_APPROVAL until that company approves.',
  })
  @ApiBody({ type: RegisterClientDto })
  registerClient(@Body() dto: RegisterClientDto) {
    return this.accounts.registerClient(dto);
  }

  @Get('branding')
  @AuthRateLimit({ key: 'branding', points: 60, durationSec: 60 })
  @ApiOperation({
    summary: 'Public white-label branding',
    description: 'Lookup by company domain for branded registration/login screens.',
  })
  @ApiQuery({ name: 'domain', required: true, example: 'acme.guards.ng' })
  getBranding(@Query('domain') domain: string) {
    return this.accounts.getBranding(domain);
  }

  @Post('refresh')
  @AuthRateLimit({ key: 'refresh', points: 30, durationSec: 60 })
  @ApiOperation({
    summary: 'Rotate refresh token',
    description: 'Public. Old refresh token is revoked; returns a new session.',
  })
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
  @ApiOperation({
    summary: 'Current authenticated account',
    description: 'Requires Bearer access token. Re-checks live account status.',
  })
  @ApiUnauthorizedResponse({ description: 'Missing/invalid/revoked token' })
  me(@CurrentUser() user: AuthenticatedRequestUser) {
    return this.session.stripSecret(user as unknown as Record<string, unknown>);
  }

  @Post('forgot-password')
  @AuthRateLimit({ key: 'forgot-password', points: 5, durationSec: 60 })
  @ApiOperation({ summary: 'Request password-reset OTP by email' })
  @ApiBody({ type: ForgotPasswordDto })
  @ApiOkResponse({ type: MessageResponseDto })
  forgotPassword(@Body() dto: ForgotPasswordDto) {
    return this.accounts.forgotPassword(dto.email, dto.accountType);
  }

  @Post('reset-password')
  @AuthRateLimit({ key: 'reset-password', points: 5, durationSec: 60 })
  @ApiOperation({
    summary: 'Reset password with OTP',
    description: 'Revokes all refresh sessions for the account.',
  })
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
  @AuthRateLimit({ key: 'mfa-verify', points: 10, durationSec: 60 })
  @ApiOperation({
    summary: 'Complete MFA challenge',
    description: 'Exchange mfaToken + email OTP for a full session.',
  })
  @ApiBody({ type: VerifyMfaDto })
  @ApiOkResponse({ type: AuthSessionResponseDto })
  verifyMfa(@Body() dto: VerifyMfaDto) {
    return this.accounts.verifyMfa(dto.mfaToken, dto.otp);
  }

  @Post('mfa/enable')
  @ApiBearerAuth('bearer')
  @UseInterceptors(AuthUserInterceptor)
  @ApiOperation({ summary: 'Enable email MFA (requires current password)' })
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
  @ApiOperation({ summary: 'Disable email MFA (requires current password)' })
  @ApiBody({ type: PasswordConfirmDto })
  @ApiOkResponse({ type: MessageResponseDto })
  disableMfa(
    @CurrentUser() user: AuthenticatedRequestUser,
    @Body() dto: PasswordConfirmDto,
  ) {
    return this.accounts.disableMfa(user, dto.password);
  }
}
