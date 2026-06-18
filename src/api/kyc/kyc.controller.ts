import {
  Controller,
  Logger,
  Get,
  Param,
  BadRequestException,
  forwardRef,
  Inject,
} from '@nestjs/common';
import {
  ApiBadRequestResponse,
  ApiBearerAuth,
  ApiBody,
  ApiOkResponse,
  ApiQuery,
  ApiTags,
} from '@nestjs/swagger';
import { Body, Post, Query, UseGuards, UseInterceptors } from '@nestjs/common/decorators';
import { CurrentUser } from '@common/decorators/current-user';
import { Staff    } from '@prisma/client';

import {
  AddressDto,
  BvnDto,
  CacVerifcationDto,
  DigitalAddressDto,
  IdentificationDto,
  LgaObjectDto,
  StateObjectDto,
  UpdateAgentKycDto,
  updateAgentProfileDto,
  uploadSignatureDto,
} from './dtos/kyc.dto';
import { KycService } from './kyc.service';
import { ApiHeaders } from '@common/decorators/defaultHeaders';
import { AuthUserInterceptor } from '@common/interceptors/authenticated-account.interceptor';
import { AgentProfileService } from '@api/user/services/agent-profile.service';
import { UserProfileDto } from '@api/user/dtos/user.dto';
import { ProfileDto } from '@api/user/dtos/profile.dto';
import { AgentWithProfile } from '@api/user/repositories/agent.repository';
import { ComonoClient, ComonoDigitalClient } from '@modules/clients/clients/comono/client';
import { RolesGuard } from '@api/authentication/guards/role.guard';
import { Role } from '@common/interfaces';
import { Roles } from '@common/decorators/role.decorator';
import { AccountType } from '@common/enums';

@ApiTags('KYC')
@Controller('kyc')
@ApiHeaders()
export class KycController {
  private readonly logger = new Logger(KycController.name);

  constructor(
    private readonly kycService: KycService,
    @Inject(forwardRef(() => AgentProfileService))
    private readonly profileService: AgentProfileService,
    private readonly comonoClient: ComonoClient,
    private readonly comonoDigitalClient: ComonoDigitalClient,
  ) {}


  @ApiBearerAuth()
  @UseInterceptors(AuthUserInterceptor)
  @UseGuards(RolesGuard)
  @Roles(AccountType.AGENT)
  @Post('/verify-id')
  @ApiBody({
    description: "Verifies user's id",
    type: IdentificationDto,
  })
  @ApiOkResponse({
    description: 'Profile details',
    type: UserProfileDto,
  })
  public async verifyId(
    @Body() payload: IdentificationDto,
    @CurrentUser() user: AgentWithProfile,  
  ) {
    return this.kycService.verifyId(user.id, payload);
  }

  @ApiBearerAuth()
  @UseInterceptors(AuthUserInterceptor)
  @UseGuards(RolesGuard)
  @Roles(AccountType.AGENT)
  @Post('/verify-bvn')
  @ApiBody({
    description: "Verifies user's bvn",
    type: BvnDto,
  })
  @ApiOkResponse({
    description: 'Profile details',
    type: UserProfileDto,
  })
  public async verifyBvn(@Body() payload: BvnDto, @CurrentUser() user: AgentWithProfile) {
    const { bvn } = payload;
    return await this.kycService.verifyBvn(bvn, user.id);
  }

  @ApiBearerAuth()
  @UseInterceptors(AuthUserInterceptor)
  @Post('/verify-cac')
  @UseGuards(RolesGuard)
  @Roles(AccountType.AGENT)
  @ApiBody({
    description: "Verifies user's cac",
    type: CacVerifcationDto,
  })
  @ApiOkResponse({
    description: 'Profile details',
    type: UserProfileDto,
  })
  public async verifyCac(@Body() data: CacVerifcationDto, @CurrentUser() user: AgentWithProfile) {
    return await this.kycService.verifyCac(user.id, data);
  }

  @Get('/get-states')
  @ApiOkResponse({
    description: 'Get a list of states',
    type: StateObjectDto,
  })
  public async getStates() {
    return this.comonoClient.getStateList();
  }

  @Get('/get-lgas/:stateCode')
  @ApiOkResponse({
    description: 'Get a list of local government areas for a state',
    type: LgaObjectDto,
  })
  public async getLgas(@Param('stateCode') stateCode: string) {
    return this.comonoClient.getLgaList(stateCode);
  }

  @ApiBearerAuth()
  @UseInterceptors(AuthUserInterceptor)
  @UseGuards(RolesGuard)
  @Roles(AccountType.AGENT)
  @Post('/update-agent-kyc')
  @ApiBody({
    description: "Verifies agent's kyc",
    type: UpdateAgentKycDto,
  })
  @ApiOkResponse({
    description: 'Profile details',
    type: UserProfileDto,
  })
  public async updateAgentKycInfo(@Body() data: UpdateAgentKycDto, @CurrentUser() user: AgentWithProfile) {
    return await this.kycService.updateAgentKyc(user.id, data);
  }

  @ApiBearerAuth()
  @UseInterceptors(AuthUserInterceptor)
  @UseGuards(RolesGuard)
  @Roles(AccountType.AGENT)
  @Post('/update-agent-profile')
  @ApiBody({
    description: "Verifies agent's profile information",
    type: updateAgentProfileDto,
  })
  public async updateAgentProfileInfo(@Body() data: updateAgentProfileDto, @CurrentUser() user: AgentWithProfile) {
    return await this.kycService.updateAgentProfile(user.id, data);
  }

}
