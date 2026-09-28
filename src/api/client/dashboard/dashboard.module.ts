import { Module } from '@nestjs/common';
import { DashboardController } from './dashboard.controller';
import { DashboardService } from './dashboard.service';
import { PrismaService } from '@database/prisma.service';
import { SecurityModule } from '@modules/security/security.module';
import { CommonAuthModule } from '@api/common/auth/common-auth.module';

@Module({
  controllers: [DashboardController],
  providers: [DashboardService, PrismaService],
  imports: [SecurityModule, CommonAuthModule],
  exports: [DashboardService],
})
export class DashboardModule {}
