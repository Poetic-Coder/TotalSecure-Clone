import { Controller, Logger } from '@nestjs/common';
import { StaffService } from '../services/staff.service';
import {
  ApiBearerAuth,
  ApiBody,
  ApiOkResponse,
  ApiOperation,
  ApiSecurity,
  ApiTags,
} from '@nestjs/swagger';
import {
  Body,
  Post,
  Get,
  Put,
  UseInterceptors,
} from '@nestjs/common/decorators';
import { ChangePasswordDto } from '../dtos/change-password.dto';
import { CurrentUser } from '@common/decorators/current-user';
import {
  PhotoUploadDto,
  ProfileDto,
  UpdateProfileDto,
} from '../dtos/profile.dto';
import { ProfileService } from '../services/staff-profile.service';
import { ApiHeaders } from '@common/decorators/defaultHeaders';
import { AuthUserInterceptor } from '@api/common/auth/interceptors/authenticated-account.interceptor';
import { Staff } from '@prisma/client';

@ApiTags('Company Staff')
@ApiHeaders()
@ApiBearerAuth('bearer')
@ApiSecurity('api-key')
@Controller('company/staff')
@UseInterceptors(AuthUserInterceptor)
export class StaffController {
  private readonly logger = new Logger(StaffController.name);

  constructor(
    private readonly staffService: StaffService,
    private readonly profileService: ProfileService,
  ) {}

  @Post('/change-password')
  @ApiOperation({ summary: 'Change password for the logged-in staff member' })
  @ApiBody({ type: ChangePasswordDto })
  @ApiOkResponse({ description: 'Password updated (staff without password)' })
  public async changePassword(
    @Body() data: ChangePasswordDto,
    @CurrentUser() user: Staff,
  ) {
    return this.staffService.changePassword(data, user);
  }

  @Post('/upload-photo')
  @ApiOperation({ summary: 'Update staff profile photo URL' })
  @ApiBody({ type: PhotoUploadDto })
  @ApiOkResponse({ description: "Updated profile", type: ProfileDto })
  public async uploadPhoto(
    @Body() payload: PhotoUploadDto,
    @CurrentUser() user: Staff,
  ) {
    this.logger.log('Got file Upload request');
    return this.profileService.uploadPhoto(user.id, payload.photo);
  }

  @Put('/profile')
  @ApiOperation({ summary: 'Update staff first/last name' })
  @ApiBody({ type: UpdateProfileDto })
  @ApiOkResponse({ description: 'Updated profile', type: ProfileDto })
  public async updateProfile(
    @Body() payload: UpdateProfileDto,
    @CurrentUser() user: Staff,
  ) {
    return this.profileService.updateBio(
      user.id,
      payload.firstName,
      payload.lastName,
    );
  }

  @Get('/profile')
  @ApiOperation({ summary: 'Get current staff profile' })
  @ApiOkResponse({ description: 'Staff profile', type: ProfileDto })
  public async staffProfile(@CurrentUser() user: Staff) {
    return this.profileService.staffProfile(user.id);
  }
}
