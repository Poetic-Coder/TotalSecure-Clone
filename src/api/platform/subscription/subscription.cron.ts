import { Injectable, Logger } from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';
import { SubscriptionService } from './subscription.service';

@Injectable()
export class SubscriptionCron {
  private readonly logger = new Logger(SubscriptionCron.name);

  constructor(private readonly subscriptionService: SubscriptionService) {}

  // Runs every day at midnight
  @Cron(CronExpression.EVERY_DAY_AT_MIDNIGHT)
  async handleTrialExpiry() {
    this.logger.log('Running trial expiry check...');
    const result = await this.subscriptionService.expireTrials();
    this.logger.log(`Trial expiry check complete — ${result?.expired ?? 0} trial(s) expired`);
  }

  // Runs every day at 8am — warning emails
  @Cron('0 8 * * *')
  async handleTrialWarnings() {
    this.logger.log('Running trial expiry warning check...');
    await this.subscriptionService.warnExpiringTrials();
    this.logger.log('Trial warning emails sent');
  }
}