import { Module } from '@nestjs/common';
import { ApiClientModule } from '@modules/clients/clients.module';
import { BackgroundModule } from '@modules/background/background.module';
import { WebhookController } from './webhook.controller';
import { HashingModule } from '@modules/hashing/hashing.module';
import { ConfigModule } from '@nestjs/config';
import { FirebaseModule } from '@modules/firebase/firebase.module';
import { FirebaseFcmService } from '@modules/firebase/firebase-fcm.service';
import { WebhookService } from './webhook.service';
import { PrismaService } from '@database/prisma.service';
import { EventService } from '@api/events/services/events.service';
import { KycModule } from '@api/kyc/kyc.module';
import { CryptoService } from '@modules/hashing/hashing.service';
import { NotificationService } from '@api/notification/notification.service';

@Module({
  imports: [
    ApiClientModule,
    BackgroundModule,
    HashingModule,
    ConfigModule,
    FirebaseModule,
    KycModule
  ],
  controllers: [WebhookController],
  providers: [
    FirebaseFcmService,
    WebhookService,
    PrismaService,
    EventService,
    CryptoService,
    NotificationService,
  ],
})
export class WebhookModule {}
