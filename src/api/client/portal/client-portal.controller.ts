import { Body, Controller, Post, UseGuards } from '@nestjs/common';
import {
  ApiBody,
  ApiOkResponse,
  ApiOperation,
  ApiTags,
  ApiTooManyRequestsResponse,
} from '@nestjs/swagger';
import { AuthRateLimit } from '@api/common/auth/decorators/auth-rate-limit.decorator';
import { AuthRateLimitGuard } from '@api/common/auth/guards/auth-rate-limit.guard';
import {
  AuthSessionResponseDto,
  SharedLoginDto,
} from '@api/common/auth/dtos/unified-auth.dto';
import { AuthAccountService } from '@api/common/auth/services/auth-account.service';

@ApiTags('Client Portal')
@Controller('client/portal')
@UseGuards(AuthRateLimitGuard)
@ApiTooManyRequestsResponse({ description: 'IP rate limit exceeded' })
export class ClientPortalController {
  constructor(private readonly accounts: AuthAccountService) {}

  @Post('login')
  @AuthRateLimit({ key: 'client-staff-login', points: 20, durationSec: 60 })
  @ApiOperation({
    summary: 'Client portal user (ClientStaff) login',
  })
  @ApiBody({ type: SharedLoginDto })
  @ApiOkResponse({ type: AuthSessionResponseDto })
  login(@Body() dto: SharedLoginDto) {
    return this.accounts.loginClientStaff(dto.email, dto.password);
  }
}
