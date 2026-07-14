import { Injectable, BadRequestException, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import axios from 'axios';

@Injectable()
export class MoolaClient {
    private readonly baseUrl: string;
    private readonly apiKey: string;
    private readonly logger = new Logger(MoolaClient.name);

    constructor(private readonly config: ConfigService) {
        this.baseUrl = this.config.get<string>('MOOLA_BACKEND_BASE_URL');
        this.apiKey = this.config.get<string>('MOOLA_X_API_KEY');
    }

    private get headers() {
        return {
            'x-api-key': this.apiKey,
            'Content-Type': 'application/json',
        };
    }

    async handshake(phone: string) {
        const url = `${this.baseUrl}/api/v1/auth/new/shake`;
        const response = await axios.post(url, { phone }, { headers: this.headers })
        const result = response.data
        this.logger.debug(result)

        if (!result) {
            this.logger.error(result);
            throw new BadRequestException('Err contacting moola');
        }
        return result;
    }

    async sendSaudiaAgent(payload) {
        const url = `${this.baseUrl}/api/v1/business-user/create-saudia-agent`;
        const response = await axios.post(url, payload, { headers: this.headers });
        const result = response.data

        this.logger.debug(result)

        if (!result) {
            this.logger.error(result);
            throw new BadRequestException('err contacting moola', result);
        }
        return result;
    }
}