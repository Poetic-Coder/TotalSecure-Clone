import { Module } from '@nestjs/common';
import { NotificationService } from './notification.service';
import { NotificationController } from './notification.controller';
import { FirebaseFcmService } from '@modules/firebase/firebase-fcm.service';
import { FirebaseModule } from '@modules/firebase/firebase.module';
import { PrismaService } from '@database/prisma.service';
@Module({
  imports: [FirebaseModule],
  controllers: [NotificationController],
  providers: [NotificationService,FirebaseFcmService,PrismaService],
  exports: [NotificationService,FirebaseFcmService],
})
export class NotificationModule {}