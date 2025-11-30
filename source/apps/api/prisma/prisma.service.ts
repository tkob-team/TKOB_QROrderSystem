import { Injectable, OnModuleInit, OnModuleDestroy, Logger } from '@nestjs/common';
import { PrismaClient, Prisma } from '@prisma/client';
import { ConfigService } from '@nestjs/config';
import { EnvConfig } from '../src/config/env.validation'; // Import Type bạn đã tạo

@Injectable()
export class PrismaService
  extends PrismaClient<Prisma.PrismaClientOptions, 'query' | 'info' | 'warn' | 'error'> // Generic để báo TS biết ta sẽ subscribe event nào
  implements OnModuleInit, OnModuleDestroy
{
  private readonly logger = new Logger(PrismaService.name);

  constructor(private readonly configService: ConfigService<EnvConfig, true>) {
    const databaseUrl = configService.get('DATABASE_URL', { infer: true });
    process.env.DATABASE_URL = databaseUrl;

    super({
      log: [
        { emit: 'event', level: 'query' }, // Quan trọng: đổi thành 'event'
        { emit: 'event', level: 'info' },
        { emit: 'event', level: 'warn' },
        { emit: 'event', level: 'error' },
      ],
    });
  }

  async onModuleInit() {
    // 1. Subscribe vào Prisma Events để đẩy qua Pino Logger
    this.$on('query', (e) => {
      if (process.env.NODE_ENV === 'development') {
        // Log query dưới dạng JSON, kèm duration để monitor performance
        this.logger.debug({
          msg: 'Prisma Query',
          query: e.query,
          params: e.params,
          duration: `${e.duration}ms`,
        });
      }
    });

    this.$on('info', (e) => this.logger.log(e.message));
    this.$on('warn', (e) => this.logger.warn(e.message));
    this.$on('error', (e) => this.logger.error(e.message));

    // 2. Kết nối DB
    try {
      await this.$connect();
      const env = this.configService.get('NODE_ENV', { infer: true });
      this.logger.log(`Database connected in ${env} mode`);
    } catch (error) {
      this.logger.error('Failed to connect to database', error);
      throw error;
    }
  }

  async onModuleDestroy() {
    await this.$disconnect();
  }
}