import { HmacService } from '@modules/hashing/hashing.service';
import { Inject, Injectable, Logger, forwardRef } from '@nestjs/common';
import { WEBHOOK_SIGNATURE_HEADER, WEBHOOK_TIMEOUT } from '../constants';
import axios, { AxiosResponse, HttpStatusCode } from "axios";
import { EventType } from '../types';
//import { EventRepository } from '../repositories/event.repository';
//import { Prisma, WebhookEvent, Workspace } from '@prisma/client';
//import ExcludeProperty from '@common/utils/exclude-property';
//import { WorkspaceWithApiKey } from '@api/workspace/services/types';
import { BackgroundService } from '@modules/background/background.service';

/**
 * Event Service
 * 
 * This should be used to send webhooks to other services
 */
@Injectable()
export class EventService {

  private readonly logger = new Logger(EventService.name);

  constructor(
    private readonly hmac: HmacService,
    //private readonly repo: EventRepository,
    @Inject(forwardRef(() => BackgroundService))
    private readonly bgService: BackgroundService,
  ) { }

/*
  async create(event: EventType, payload: any, workspaceId: string) {
    return this.repo.create({
      data: {
        event: event.toString(),
        data: payload,
        workspace: {
          connect: {
            id: workspaceId,
          }
        }
      }
    });
  }

  async update(query: Prisma.WebhookEventUpdateArgs) {
    return this.repo.update(query);
  }

  async excludeProps(events: Promise<WebhookEvent[]>) {
    return (await events).map(
      (event) =>
        ExcludeProperty(event, ['pk', 'workspacePk', 'workspaceId'])
    );
  }
*/
  /**
   * Get all events from db
   */
  //async all() {
  //  return this.excludeProps(this.findMany({}));
  //}

  //async findMany(query: Prisma.WebhookEventFindManyArgs) {
  //  return this.excludeProps(this.repo.findMany(query));
 // }

  /**
   * Get all events for a workspace
   * 
   * @param workspaceId The workspace id to get events for
   */
  /* async getWorkspaceEvents(workspaceId: string) {
    return this.excludeProps(this.findMany({
      where: {
        workspaceId: workspaceId,
      }
    }));
  }
*/

  /**
   * Signs payload using provided key
   * 
   * @param payload data to sign
   * @param key key to use to sign payload
   * @returns signature
   */
  async signPayload(payload: any, key: string): Promise<string> {
    return this.hmac.encrypt(payload, key);
  }

  /**
   * Combines payload, event type and timestamp into a single object
   * and signs it using the provided key
   * 
   * @param event Event type
   * @param payload Payload to send
   * @param key Key to use to sign payload
   * @returns Signature and data to send
   */
  async getDataSignature(event: EventType, event_id: string, payload: any, key: string) {
    const timestamp = new Date().toISOString();
    const data = {
      event: event,
      id: event_id,
      payload,
      timestamp,
    }
    const signature = await this.signPayload(data, key);
    return {
      signature,
      data,
    }
  }

  /**
   * Send event to URL
   * 
   * @param event Event type
   * @param payload Payload to send
   * @param key Key to use to sign payload
   * @param url URL to send payload to
   * @returns True if successful, false otherwise
   */
  async sendEvent(event: EventType, event_id: string, payload: any, key: string, url: string) {
    const { signature, data } = await this.getDataSignature(
      event, event_id, payload, key
    );
    const response: AxiosResponse = await axios.post(url, data, {
      headers: {
        'Content-Type': 'application/json',
        [WEBHOOK_SIGNATURE_HEADER]: signature,
      },
      timeout: WEBHOOK_TIMEOUT,
    }).then(data => data).catch((error) => {
      this.logger.error(`Error on request to webhook ${url}`)
      this.logger.error(error)
      return error
    });
    return response.status == HttpStatusCode.Ok
  }

  /**
   * Creates and forwards event payloads to workspace webhooks
   * 
   * @param type type of event
   * @param payload payload to deliver
   * @param workspace workspace with api key of recipient
   */
  /* async transmitEvent(type: EventType, payload: any, workspace: WorkspaceWithApiKey) {
    const event = await this.create(type, payload, workspace.id)

    this.logger.debug(`Sending event ${type} to ${workspace.webhookUrl}`)
    this.logger.debug(`Workspace ${workspace.id}`)
    this.logger.debug("payload", payload)

    await this.bgService.handleWebhookEvent({
      id: event.id,
      event: type,
      payload: {
        id: event.id,
        ...payload,
      },
      key: workspace.apiKey.key,
      url: workspace.webhookUrl,
    })
    return event
  }
    */
}