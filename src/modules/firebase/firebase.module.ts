import { Global, Module } from '@nestjs/common';
import { FirebaseFcmService } from './firebase-fcm.service';
import { firebaseProvider } from './firebase.provider';
import { FIREBASE } from './firebase.const';

@Module({
  providers: [firebaseProvider, FirebaseFcmService],
  exports: [firebaseProvider, FirebaseFcmService],
})
export class FirebaseModule {}
