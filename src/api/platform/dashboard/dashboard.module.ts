import { Module } from '@nestjs/common';
import { DashboardService } from './dashboard.service';
import { DashboardController } from './dashboard.controller';
import { PrismaService } from '@database/prisma.service';
import { SecurityModule } from '@modules/security/security.module';
import { CommonAuthModule } from '@api/common/auth/common-auth.module';
import { DatabaseModule } from '@database/database.module';

@Module({
  providers: [DashboardService],
  imports: [SecurityModule, CommonAuthModule, DatabaseModule],
  controllers: [DashboardController],
})
export class DashboardModule {}
