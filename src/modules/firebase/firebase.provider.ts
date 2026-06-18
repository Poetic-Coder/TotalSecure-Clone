import * as admin from 'firebase-admin';
import * as ServiceAccount from '@config/firebase/ServiceAccount.json';
import { FIREBASE } from './firebase.const';
export const firebaseProvider = {
  provide: FIREBASE,
  useFactory: () => {
    const app = admin.initializeApp({
      credential: admin.credential.cert(ServiceAccount),
      
    });
    return {
      app,
      messaging: admin.messaging(app)
    };
  }
};