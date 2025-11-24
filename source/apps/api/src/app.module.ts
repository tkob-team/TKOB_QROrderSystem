import { Module } from '@nestjs/common';
import { LoggerModule } from 'nestjs-pino';
import { ConfigModule } from '@nestjs/config';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { validate } from './config/env.validation';
import { PrismaModule } from '../prisma/prisma.module';

@Module({
  imports: [
    LoggerModule.forRoot({
      pinoHttp: {
        transport:
          process.env.NODE_ENV !== 'production'
            ? {
                target: 'pino-pretty',
                options: {
                  colorize: true,
                  translateTime: 'SYS:standard',
                  ignore: 'pid,hostname',
                },
              }
            : undefined,
        level: process.env.LOG_LEVEL || 'info',
        autoLogging: true,
      },
    }),
    ConfigModule.forRoot({
      // Global: true để không phải import ConfigModule ở các module con (Feature Modules)
      isGlobal: true,

      // Chỉ định hàm validate custom
      validate: validate,

      // Cache: true để tăng performance, tránh đọc process.env nhiều lần
      cache: true,

      // Mở rộng: Load file .env tùy theo môi trường (optional)
      // envFilePath: `.env.${process.env.NODE_ENV || 'development'}`,
    }),
    PrismaModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
