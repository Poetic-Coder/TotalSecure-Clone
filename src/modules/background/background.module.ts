import { forwardRef, Module } from '@nestjs/common';
import { BullModule } from '@nestjs/bull';
import { BackgroundService } from './background.service';
import { QUEUES } from './constants';
import { DatabaseModule } from '@database/database.module';
import { ApiClientModule } from '@modules/clients/clients.module';

import { EventModule } from '@api/events/events.module';
import { BullBoardModule } from "@bull-board/nestjs";
import { BullAdapter } from '@bull-board/api/bullAdapter';
import { KycModule } from '@api/kyc/kyc.module';
import { FirebaseFcmService } from '@modules/firebase/firebase-fcm.service';
import { FirebaseModule } from '@modules/firebase/firebase.module';
import { ConfigModule, ConfigService } from '@nestjs/config';
@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    DatabaseModule,
    BullModule.registerQueue(
      {
        name: QUEUES.global,
      },
      {
        name: QUEUES.address
      },
      {
        name: QUEUES.tsq
      },
      {
        name: QUEUES.appzone
      },
      {
        name: QUEUES.webhook
      },
      {
        name: QUEUES.comono
      },
      {
        name: QUEUES.transfer
      },
      {
        name: QUEUES.saga,
      },
      { name: QUEUES.dead_letter },
    ),
    BullBoardModule.forFeature(
      {
        name: QUEUES.global,
        adapter: BullAdapter,
      },
      {
        name: QUEUES.address,
        adapter: BullAdapter,
      },
      {
        name: QUEUES.tsq,
        adapter: BullAdapter,
      },
      {
        name: QUEUES.appzone,
        adapter: BullAdapter,
      },
      {
        name: QUEUES.webhook,
        adapter: BullAdapter,
      },
      {
        name: QUEUES.comono,
        adapter: BullAdapter,
      },
      {
        name: QUEUES.transfer,
        adapter: BullAdapter,
      },
      { 
        name: QUEUES.saga, 
        adapter: BullAdapter 
      },
      { 
        name: QUEUES.dead_letter, 
        adapter: BullAdapter 
      }
      
    ),
    forwardRef(() => ApiClientModule),
    forwardRef(() => EventModule),
    KycModule,
    FirebaseModule,
  ],
  providers: [
    ConfigService,
    BackgroundService, 
    FirebaseFcmService
  ],
  exports: [BackgroundService],
})
export class BackgroundModule { }
