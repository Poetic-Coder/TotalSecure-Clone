import { Module } from '@nestjs/common';
import { DashboardController } from './dashboard.controller';
import { DashboardService } from './dashboard.service';
import { SecurityModule } from '@modules/security/security.module';
import { CommonAuthModule } from '@api/common/auth/common-auth.module';
import { DatabaseModule } from '@database/database.module';

@Module({
  controllers: [DashboardController],
  providers: [DashboardService],
  imports: [SecurityModule, CommonAuthModule, DatabaseModule],
  exports: [DashboardService],
})
export class DashboardModule {}
