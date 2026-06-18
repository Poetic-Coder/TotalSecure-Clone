import { DynamicObject } from '@common/interfaces';
import { Injectable, Inject } from '@nestjs/common';
import { FIREBASE } from './firebase.const';
import * as admin from 'firebase-admin';

@Injectable()
export class FirebaseFcmService {
  private readonly messaging: admin.messaging.Messaging;

  constructor(
    @Inject(FIREBASE)
    private readonly firebase: {
      app: admin.app.App;
      messaging: admin.messaging.Messaging;
    },
  ) {
    this.messaging = this.firebase.messaging;
  }

  public sendMessage(idToken: string, payload: DynamicObject) {
    const stringPayload: { [key: string]: string } = {};
    Object.keys(payload).forEach((key) => {
      stringPayload[key] = String(payload[key]);
    });
  
    const message: admin.messaging.Message = {
      data: stringPayload,
      token: idToken,
      notification: {
        title: stringPayload.title,
        body: stringPayload.body,
      },
    };
    return this.messaging.send(message);
  }
  
}