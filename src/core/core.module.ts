import { CacheModule, Logger, Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { redisStore } from 'cache-manager-redis-yet';

@Module({
  imports: [
    CacheModule.registerAsync({
      isGlobal: true,
      imports: [ConfigModule.forRoot()],
      useFactory: async (config: ConfigService) => {

        const logger = new Logger(CacheModule.name);

        const protocol = config.get<boolean>('REDIS_SSL') ? 'rediss' : 'redis';
        const password = config.get('REDIS_PASSWORD');
        const host = config.get('REDIS_HOST');
        const port = config.get('REDIS_PORT');

        logger.log(`Redis connection: ${protocol}://:${password}@${host}:${port}`);

        return {
          store: await redisStore({
            ttl: 5000,
            url: `${protocol}://:${password}@${host}:${port}`,
          }),
        };
      },
      inject: [ConfigService],
    }),
  ],
  exports: [CacheModule],
})
export class CoreModule {}
