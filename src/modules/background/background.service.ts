import { Injectable, Logger } from '@nestjs/common';
import { Queue } from 'bull';
import { InjectQueue } from '@nestjs/bull';
import { JOBS, QUEUES } from './constants';
import {
  MAX_TSQ_RETRY,
  WEBHOOK_RETRY_COUNT,
  WEBHOOK_RETRY_DELAY,
  TSQ_RETRY_LOCAL_BANK_TRANSFER_DELAY,
  TSQ_RETRY_INTER_BANK_TRANSFER_DELAY,
} from '@common/constants';
import { EventPayload } from '@api/events/types';

@Injectable()
export class BackgroundService {
  constructor(
    @InjectQueue(QUEUES.address) private addressQueue: Queue,
    @InjectQueue(QUEUES.tsq) private transactionStatusQueue: Queue,
    @InjectQueue(QUEUES.appzone) private appzoneQueue: Queue,
    @InjectQueue(QUEUES.comono) private comonoQueue: Queue,
    @InjectQueue(QUEUES.webhook) private webhookQueue: Queue,
    @InjectQueue(QUEUES.transfer) private transferQueue: Queue,
  ) {}

  private logger = new Logger(BackgroundService.name);

  async verifyAddress(data: any) {
    await this.addJobToRetrialQueue(
      this.addressQueue,
      data,
      JOBS.addressWebhookEvent,
    );
  }

  async addTransferQueue(data: any) {
    
    await this.addMultipleJobToRetrialQueue(
      this.transferQueue,
      data,
      JOBS.transferJob,
    );
  }

  async handleAppzoneHook(data: any) {
    // await this.appzoneQueue.clean(0, 'failed');
    await this.addJobToRetrialQueue(
      this.appzoneQueue, data, JOBS.appzoneWebhookEvent);
  }

  async handleComonoHook(data: any) {
    await this.addJobToRetrialQueue(
      this.comonoQueue,
      data,
      JOBS.comonoWebhookEvent,
    );
  }

  async handleComonoDigitalHook(data: any) {
    await this.addJobToRetrialQueue(
      this.comonoQueue,
      data,
      JOBS.comonoDigitalWebhookEvent,
    );
  }

  async handlePhysicalAddressVerificationRequest(data: any) {
    await this.addJobToRetrialQueue(
      this.comonoQueue,
      data,
      JOBS.comonoPhysicalRequest,
    );
  }

  async handleWebhookEvent(data: EventPayload) {
    await this.addJobToRetrialQueue(
      this.webhookQueue,
      data,
      JOBS.sendWebhookEvent,
    );
  }

  async addJobToRetrialQueue(queue: Queue, data: any, type: string) {
    this.logger.debug(`Queue inserted for ${type}`);
    await queue.add(type, data, {
      attempts: WEBHOOK_RETRY_COUNT,
      backoff: {
        type: 'exponential',
        delay: WEBHOOK_RETRY_DELAY,
      },
    });
  }

  async addMultipleJobToRetrialQueue(queue: Queue, data: any[], type: string) {
    this.logger.debug(`Adding ${data.length} jobs to queue for ${type}`);
    if (data.length === 0) {
      this.logger.warn('No jobs to add to queue');
      return [];
    }
    const jobs = [];
    for (const job of data) {
      try {
        const addedJob = await queue.add(
          type,
          job,
          {
            jobId: job.id, // Unique job ID based on transferId
            attempts: 5,
            backoff: { type: 'exponential', delay: 2000 },
            removeOnComplete: true,
            removeOnFail: false,
          }
        );
        jobs.push(addedJob);
        this.logger.debug(`Added job for transfer ID: ${job.id}, Job ID: ${addedJob.id}`);
      } catch (error) {
        this.logger.error(`Failed to add job for transfer ID: ${job.id}, Error: ${error.message}`, error.stack);
        throw new Error(`Failed to add job to queue: ${error.message}`);
      }
    }
    this.logger.debug(`Successfully added ${jobs.length} jobs to queue`);
    return jobs;
  }




  
  public async inspectQueue() {
    const jobCounts = await this.transferQueue.getJobCounts();
    const waitingJobs = await this.transferQueue.getWaiting();
    this.logger.debug(`Queue job counts: ${JSON.stringify(jobCounts)}`);
    this.logger.debug(`Waiting jobs: ${JSON.stringify(waitingJobs.map(job => ({ id: job.id, data: job.data })))}`);
    return { jobCounts, waitingJobs };
  }
}
