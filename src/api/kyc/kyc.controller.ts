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


@ApiTags('KYC')
@Controller('kyc')
@ApiHeaders()
export class KycController {
  private readonly logger = new Logger(KycController.name);

  constructor(

  ) {}


}
