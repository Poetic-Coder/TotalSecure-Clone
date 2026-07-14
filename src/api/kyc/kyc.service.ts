import {
  BadRequestException,
  Injectable,
  Logger,
  Inject,
  forwardRef,
  ConflictException,
} from '@nestjs/common';

@Injectable()
export class KycService {
  private readonly logger = new Logger(KycService.name);

  constructor(

  ) { }

}