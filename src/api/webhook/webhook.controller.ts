import {
  BadRequestException,
  Controller,
  HttpCode,
  HttpStatus,
  Post,
  Req,
  UnauthorizedException,
  Res,
  Logger,
  UseGuards,
  Headers
} from '@nestjs/common';
import { ApiBody, ApiTags } from '@nestjs/swagger';
import { Body } from '@nestjs/common';
import { Request, response, Response } from 'express';
import { BackgroundService } from '@modules/background/background.service';
import {
  APPZONE_SIGNATURE_HEADER,
  APPZONE_WEBHOOK_SIGNATURE,
  APPZONE_WEBHOOK_URL,
  COMONO_DIGITAL_WEBHOOK_URL,
  COMONO_SIGNATURE_HEADER,
  COMONO_WEBHOOK_SIGNATURE,
  COMONO_WEBHOOK_URL,
  VERIFY_ME_WEBHOOK_HEADER,
  VERIFY_ME_WEBHOOK_URL,
  INTERSWITCH_CARD_UPDATE_URL,
  INTERSWITCH_CARD_UPDATE_SIGNATURE,
  YOUVERIFY_URL,
  YOUVERIFY_SIGNATURE,
  OKHI_URL,
} from '@common/constants';
import { AddressPayload, AgentApprovalDto, CardPayload } from './dtos/index.dto';
import { AppzoneWebhookDto } from './dtos/appzone.dto';
import { ConfigService } from '@nestjs/config';
import { HashingService, CryptoService } from '@modules/hashing/hashing.service';
import { WebhookService } from './webhook.service';
import * as crypto from 'crypto';
import { WebhookAuthGuard } from './gaurds/webbook.auth.guard';

@ApiTags('Webhooks')
@Controller('webhook')
export class WebhookController {
  private readonly logger = new Logger(WebhookController.name);
  constructor(
    private readonly backgroudService: BackgroundService,
    private readonly configService: ConfigService,
    private readonly hashingService: HashingService,
    private readonly webhookService: WebhookService,
    private readonly cryptoService: CryptoService,
  ) {}
  

  @Post('agent-approval')
  @UseGuards(WebhookAuthGuard)
  async handleAgentApproval(
    @Body() payload: any,
    @Headers('x-moola-signature') signature: string,
  ) {
   return await this.webhookService.processAgentApproval(payload);
  }

}
