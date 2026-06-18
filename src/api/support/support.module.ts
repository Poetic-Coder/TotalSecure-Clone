import { Module } from '@nestjs/common';
import { SupportService } from './support.service';
import { SupportController } from './support.controller';
import { SupportTicketService } from '@modules/clients/clients/helpAndSupport/supportService';
import { UserModule } from '@api/user/user.module';
import { DatabaseModule } from '@database/database.module'; 
import { AuthenticationModule } from '@api/authentication/authentication.module';
import { SecurityModule } from '@modules/security/security.module';

@Module({
  imports: [ UserModule, DatabaseModule, AuthenticationModule, SecurityModule],
  providers: [SupportService, SupportTicketService],
  controllers: [SupportController],
  exports: [SupportService],
})
export class SupportModule {}
