
import { Injectable } from '@nestjs/common';
import { SharedBullConfigurationFactory, BullModuleOptions } from '@nestjs/bull';
import { ConfigService } from '@nestjs/config';


@Injectable()
export class BullConfigService implements SharedBullConfigurationFactory {

    constructor(private readonly configService: ConfigService) { }

    createSharedConfiguration(): BullModuleOptions {
        return {
            redis: {
                host: this.configService.get('REDIS_HOST'),
                port: +this.configService.get('REDIS_PORT'),
                password: this.configService.get('REDIS_PASSWORD'),
            },
        };
    }
}