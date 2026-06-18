import { Module, forwardRef } from '@nestjs/common';
import { ApiClientModule } from '@modules/clients/clients.module';
import { ConfigModule } from '@nestjs/config';
import { KycService } from './kyc.service';
import { KycController } from './kyc.controller';
import { DatabaseModule } from '@database/database.module'; 
import { SecurityModule } from '@modules/security/security.module';
import { UserModule } from '@api/user/user.module';
import { VirtualSwitchAIService } from '@modules/clients/clients/ai/virtualSwitchAi';
import { YouVerifyService } from '@modules/clients/clients/youVerify/youVerify';
import { VerifyMeClient } from '@modules/clients/clients/verifyMe/verifyMe';
import { ComonoDigitalClient } from '@modules/clients/clients/comono/client';
import { ComonoClient } from '@modules/clients/clients/comono/client';

@Module({
  imports: [
    forwardRef(() => UserModule),
    forwardRef(() => ApiClientModule),
    ConfigModule,
    DatabaseModule,
    SecurityModule,

  ],
  controllers: [KycController],
  providers: [KycService, VirtualSwitchAIService, YouVerifyService,VerifyMeClient, ComonoDigitalClient, ComonoClient],
  exports: [KycService],
})
export class KycModule {}
