import {
  Body,
  Controller,
  Get,
  Post,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import {
  ApiBadRequestResponse,
  ApiBearerAuth,
  ApiBody,
  ApiOkResponse,
  ApiOperation,
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
  RegisterClientDto,
  ResetPasswordDto,
  SharedLoginDto,
  VerifyMfaDto,
} from '@api/common/auth/dtos/unified-auth.dto';
import { AuthAccountService } from '@api/common/auth/services/auth-account.service';
import { AuthSessionService } from '@api/common/auth/services/auth-session.service';
import { CurrentUser } from '@common/decorators/current-user';
import { AuthenticatedRequestUser } from '@common/interfaces';

@ApiTags('Client Auth')
@Controller('client/auth')
@UseGuards(AuthRateLimitGuard)
@ApiTooManyRequestsResponse({ description: 'IP rate limit exceeded' })
export class ClientAuthController {
  constructor(
    private readonly accounts: AuthAccountService,
    private readonly session: AuthSessionService,
  ) {}

  @Post('login')
  @AuthRateLimit({ key: 'client-login', points: 20, durationSec: 60 })
  @ApiOperation({
    summary: 'Client portal login',
    description: 'Public. Client account only.',
  })
  @ApiBody({ type: SharedLoginDto })
  @ApiOkResponse({ type: AuthSessionResponseDto })
  @ApiBadRequestResponse({ description: 'Invalid credentials or blocked' })
  login(@Body() dto: SharedLoginDto) {
    return this.accounts.loginClient(dto.email, dto.password);
  }

  @Post('register')
  @AuthRateLimit({ key: 'client-register', points: 10, durationSec: 60 })
  @ApiOperation({
    summary: 'Client self-signup via white-label domain',
    description:
      'Public. Pass company domain (e.g. acme.guards.ng). Status PENDING_APPROVAL until company approves.',
  })
  @ApiBody({ type: RegisterClientDto })
  register(@Body() dto: RegisterClientDto) {
    return this.accounts.registerClient(dto);
  }

  @Post('refresh')
  @AuthRateLimit({ key: 'client-refresh', points: 30, durationSec: 60 })
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
  @ApiOperation({ summary: 'Current client account' })
  me(@CurrentUser() user: AuthenticatedRequestUser) {
    return this.session.stripSecret(user as unknown as Record<string, unknown>);
  }

  @Post('forgot-password')
  @AuthRateLimit({ key: 'client-forgot-password', points: 5, durationSec: 60 })
  @ApiOperation({ summary: 'Request password-reset OTP (accountType=CLIENT)' })
  @ApiBody({ type: ForgotPasswordDto })
  @ApiOkResponse({ type: MessageResponseDto })
  forgotPassword(@Body() dto: ForgotPasswordDto) {
    return this.accounts.forgotPassword(dto.email, dto.accountType);
  }

  @Post('reset-password')
  @AuthRateLimit({ key: 'client-reset-password', points: 5, durationSec: 60 })
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
  @AuthRateLimit({ key: 'client-mfa-verify', points: 10, durationSec: 60 })
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
