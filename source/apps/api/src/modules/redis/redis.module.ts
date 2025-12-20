import { Global, Module } from "@nestjs/common";
import { ConfigModule, ConfigService } from "@nestjs/config";
import Redis from 'ioredis';
import { EnvConfig } from "src/config/env.validation";
import { RedisService } from './redis.service';

@Global()
@Module({
  imports: [ConfigModule],
  providers: [
    {
      provide: 'REDIS_CLIENT',
      useFactory: (configService: ConfigService<EnvConfig, true>) => {
        const password = configService.get('REDIS_PASSWORD', { infer: true });
        
        const client = new Redis({
          host: configService.get('REDIS_HOST', { infer: true }),
          port: configService.get('REDIS_PORT', { infer: true }),
          password: password || undefined,
          db: configService.get('REDIS_DB', { infer: true }),
          tls: {}, // Enable TLS for Upstash
          maxRetriesPerRequest: 3,
          retryStrategy: (times) => {
            if (times > 5) return null;
            const delay = Math.min(times * 1000, 5000);
            return delay;
          },
          lazyConnect: false,
          enableReadyCheck: false,
          connectTimeout: 10000,
        });

        client.on('error', (err) => {
          console.error('Redis Client Error', err);
        });

        client.on('connect', () => {
          console.log('Redis Client Connected');
        });

        client.on('ready', () => {
          console.log('Redis Client Ready');
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