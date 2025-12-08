import { MiddlewareConsumer, Module, NestModule, RequestMethod } from '@nestjs/common';
import { LoggerModule } from 'nestjs-pino';
import { ConfigModule } from '@nestjs/config';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { validate } from './config/env.validation';
import { PrismaModule } from './database/prisma.module';
import { RedisModule } from './modules/redis/redis.module';
import { EmailModule } from './modules/email/email.module';
import { AuthModule } from './modules/auth/auth.module';
import { TenantModule } from './modules/tenant/tenant.module';
import { RequestIdMiddleware } from './common/middleware/request-id.middleware';
import { TenantContextMiddleware } from './common/middleware/tenant-context.middleware';
import { MenuModule } from './modules/menu/menu.module';

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

    // MainModule
    PrismaModule,
    RedisModule,
    EmailModule,
    AuthModule,
    TenantModule,
    MenuModule,
  ],
  controllers: [AppController],
  providers: [
    AppService,
    // Make JwtAuthGuard global (optional, để protect tất cả routes by default)
    // {
    //   provide: APP_GUARD,
    //   useClass: JwtAuthGuard,
    // },
  ],
})
export class AppModule implements NestModule {
  configure(consumer: MiddlewareConsumer) {
    // Apply RequestIdMiddleware globally
    consumer.apply(RequestIdMiddleware).forRoutes({ path: '*path', method: RequestMethod.ALL });

    // Apply TenantContextMiddleware to tenant routes
    consumer
      .apply(TenantContextMiddleware)
      .exclude(
        { path: 'api/v1/auth/login', method: RequestMethod.POST },
        { path: 'api/v1/auth/register/submit', method: RequestMethod.POST },
        { path: 'api/v1/auth/register/confirm', method: RequestMethod.POST },
        { path: 'api/v1/auth/refresh', method: RequestMethod.POST },
        { path: 'api/v1/auth/logout', method: RequestMethod.POST },
        { path: 'api/v1/auth/logout-all', method: RequestMethod.POST },
        { path: 'api/v1/auth/me', method: RequestMethod.GET },
        // ... thêm các route public khác nếu có
      )
      .forRoutes({ path: '*path', method: RequestMethod.ALL });
  }
}
