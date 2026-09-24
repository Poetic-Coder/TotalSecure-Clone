import { Module } from '@nestjs/common';
import { SupportService } from './support.service';
import { SupportController } from './support.controller';
import { SupportTicketService } from '@modules/clients/clients/helpAndSupport/supportService';
import { DatabaseModule } from '@database/database.module';
import { CommonAuthModule } from '@api/common/auth/common-auth.module';
import { SecurityModule } from '@modules/security/security.module';

@Module({
  imports: [DatabaseModule, CommonAuthModule, SecurityModule],
  providers: [SupportService, SupportTicketService],
  controllers: [SupportController],
  exports: [SupportService],
})
export class SupportModule {}
