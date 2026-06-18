import { Controller, Logger } from '@nestjs/common';
import { CustomerService } from '../services/customer.service';   
import {
  ApiBearerAuth,
  ApiBody,
  ApiOkResponse,
  ApiTags,
} from '@nestjs/swagger';
import {
  Body,
  Post,
  Get,
  Put,
  UseInterceptors,
} from '@nestjs/common/decorators';
import { ChangePasswordDto } from '../dtos/register.dto';
import { CurrentUser } from '@common/decorators/current-user';
import {
  PhotoUploadDto,
  ProfileDto,
  UpdateProfileDto,
} from '../dtos/profile.dto';
import { CustomerProfileService } from '../services/customer-profile.service';

import { ApiHeaders } from '@common/decorators/defaultHeaders';
import { AuthUserInterceptor } from '@common/interceptors/authenticated-account.interceptor';
import { KycService } from '@api/kyc/kyc.service';
import { Customer } from '@prisma/client';

@ApiTags('Customer')
@ApiHeaders()
@Controller('customer')
export class CustomerController {
  private readonly logger = new Logger(CustomerController.name);

  constructor(
    private readonly customerService: CustomerService,
    private readonly profileService: CustomerProfileService,
    private readonly kycService: KycService,
  ) {}

  @ApiBearerAuth()
  @UseInterceptors(AuthUserInterceptor)
  @Post('/change-password')
  @ApiBody({
    description: 'Change password',
    type: ChangePasswordDto,
  })
  @ApiOkResponse({
    description: 'Login user',
    type: ProfileDto,
  })
  public async changePassword(
    @Body() data: ChangePasswordDto,
    @CurrentUser() user: Customer,
  ) {
    return this.customerService.changePassword(data, user);
  }

  @ApiBearerAuth()
  @UseInterceptors(AuthUserInterceptor)
  @Post('/upload-photo')
  @ApiBody({
    description: "Upload user's photo",
    type: PhotoUploadDto,
  })
  @ApiOkResponse({
    description: "Upload user's photo",
    type: ProfileDto,
  })
  public async uploadPhoto(
    @Body() payload: PhotoUploadDto,
    @CurrentUser() user: Customer,
  ) {
    this.logger.log('Got file Upload request');
    return await this.profileService.uploadPhoto(user.id, payload.photo);
  }

  @ApiBearerAuth()
  @UseInterceptors(AuthUserInterceptor)
  @Put('/profile')
  @ApiBody({
    description: "Update's user's pofile",
    type: UpdateProfileDto,
  })
  @ApiOkResponse({
    description: 'Updated Profile',
    type: ProfileDto,
  })
  public async updateProfile(
    @Body() payload: UpdateProfileDto,
    @CurrentUser() user: Customer,
  ) {
    const { firstName, lastName } = payload;
    return await this.profileService.updateBio(

      user.id,
      firstName,
      lastName,
    );
  }

  @ApiBearerAuth()
  @UseInterceptors(AuthUserInterceptor)
  @Get('/profile')
  @ApiOkResponse({
    description: 'Customer profile',
    type: ProfileDto,
  })
  public async customerProfile(@CurrentUser() user: Customer) {
    return this.profileService.customerProfile(user.id);
  }

  

}
