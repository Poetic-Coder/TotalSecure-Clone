import { Injectable, CanActivate, ExecutionContext, UnauthorizedException } from '@nestjs/common';
import { WebhookService } from '../webhook.service';
import { createHmac, timingSafeEqual } from 'crypto';

@Injectable()
export class WebhookAuthGuard implements CanActivate {
    constructor(private readonly webhookService: WebhookService) { }

    private readonly webhookSecret = process.env.MOOLA_WEBHOOK_SECRET;

    async canActivate(context: ExecutionContext): Promise<boolean> {
        const request = context.switchToHttp().getRequest();
        const signature = request.headers['x-moola-signature'];

        if (!signature) {
            throw new UnauthorizedException('Missing webhook signature');
        }

        const isValid = this.verifySignature(
            request.body,
            signature
        );

        if (!isValid) {
            throw new UnauthorizedException('Invalid webhook signature');
        }

        return true;
    }

    private verifySignature(payload: any, signature: string): boolean {
        const jsonString = JSON.stringify(payload);

        if (!this.webhookSecret) {
            throw new Error('MOOLA_WEBHOOK_SECRET not configured');
        }

        const hmac = createHmac('sha256', this.webhookSecret);
        const expectedSignature = hmac.update(jsonString).digest('hex');

        return timingSafeEqual(
            Buffer.from(signature),
            Buffer.from(expectedSignature)
        );
    }
}

