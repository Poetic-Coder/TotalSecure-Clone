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


}
