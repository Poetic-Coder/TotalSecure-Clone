import { Module } from '@nestjs/common';
import { PlatformAuthModule } from './auth/platform-auth.module';
import { PlatformAdminModule } from './admin/platform-admin.module';
import { PlansModule } from './plans/plans.module';
import { SubscriptionModule } from './subscription/subscription.module';

@Module({
  imports: [PlatformAuthModule, PlatformAdminModule, PlansModule, SubscriptionModule],
})
export class PlatformModule {}
