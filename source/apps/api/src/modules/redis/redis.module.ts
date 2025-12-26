import { Global, Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import Redis from 'ioredis';
import { EnvConfig } from 'src/config/env.validation';
import { RedisService } from './redis.service';

@Global()
@Module({
  imports: [ConfigModule],
  providers: [
    {
      provide: 'REDIS_CLIENT',
      useFactory: (configService: ConfigService<EnvConfig, true>) => {
        const redisUrl = configService.get('REDIS_URL', { infer: true });

        let client: Redis;

        // Priority: REDIS_URL (Render) > Individual vars (Local)
        if (redisUrl) {
          // Render/Production: Use REDIS_URL
          console.log('🔗 Using REDIS_URL connection');
          client = new Redis(redisUrl, {
            maxRetriesPerRequest: 3,
            retryStrategy: (times) => {
              const delay = Math.min(times * 50, 2000);
              return delay;
            },
            lazyConnect: false,
          });
        } else {
          // Local: Use individual variables
          console.log('🔗 Using individual Redis config');
          const password = configService.get('REDIS_PASSWORD', { infer: true });

          client = new Redis({
            host: configService.get('REDIS_HOST', { infer: true }),
            port: configService.get('REDIS_PORT', { infer: true }),
            password: password || undefined,
            db: configService.get('REDIS_DB', { infer: true }),
            retryStrategy: (times) => {
              const delay = Math.min(times * 50, 2000);
              return delay;
            },
            lazyConnect: false,
          });
        }

        client.on('error', (err) => {
          console.error('❌ Redis Client Error', err);
        });

        client.on('connect', () => {
          console.log('✅ Redis Client Connected');
        });

        client.on('ready', () => {
          console.log('✅ Redis Client Ready');
        });

        return client;
      },
      inject: [ConfigService],
    },
    RedisService,
  ],
  exports: ['REDIS_CLIENT', RedisService],
})
export class RedisModule {}
