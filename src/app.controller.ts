import { ApiHeaders } from '@common/decorators/defaultHeaders';
import { CACHE_MANAGER, Controller, Get, Inject, Logger } from '@nestjs/common';
import { Cache } from 'cache-manager';
import { BackgroundService } from '@modules/background/background.service';
import { EventType } from '@api/events/types';

@Controller('app')
@ApiHeaders()
export class AppController {
  private readonly logger = new Logger(AppController.name);

  constructor(
    @Inject(CACHE_MANAGER) private cacheManager: Cache,
    private readonly backgroundService: BackgroundService,
  ) {}

  @Get('hello')
  getHello(): string {
    this.logger.log('Calling getHello()', AppController.name);
    this.logger.debug('Calling getHello()', AppController.name);
    this.logger.verbose('Calling getHello()', AppController.name);
    this.logger.warn('Calling getHello()', AppController.name);

    try {
      throw new Error();
    } catch (e) {
      this.logger.error('Calling getHello()', e.stack, AppController.name);
    }

    return 'Hello World';
  }

  @Get('test-queue')
  async queueTest() {
    await this.backgroundService.handleWebhookEvent({
      id: 'test',
      event: EventType.ACCOUNT_CREATED,
      payload: 'test',
      key: 'test',
      url: 'test',
    });
  }

  @Get('cache-set')
  async cacheSet() {
    await this.cacheManager.set('test', 'test', 10000);
    return 'Set Cache';
  }

  @Get('cache-get')
  cacheGet() {
    return this.cacheManager.get('test');
  }
}
