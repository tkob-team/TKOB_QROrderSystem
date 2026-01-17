import { MiddlewareConsumer, Module, NestModule, OnModuleInit, RequestMethod, Logger } from '@nestjs/common';
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
import { ArrayQueryMiddleware } from './common/middleware/array-query.middleware';
import { SessionMiddleware } from './common/middleware/session.middleware';
import { MenuModule } from './modules/menu/menu.module';
import { TableModule } from './modules/table/table.module';
import { OrderModule } from './modules/order/order.module';
import { PaymentModule } from './modules/payment/payment.module';
import { AnalyticsModule } from './modules/analytics/analytics.module';
import { StaffModule } from './modules/staff/staff.module';
import { ReviewModule } from './modules/review/review.module';
import { PaymentConfigModule } from './modules/payment-config/payment-config.module';
import { PromotionModule } from './modules/promotion/promotion.module';
import { SubscriptionModule } from './modules/subscription/subscription.module';
import { WebsocketModule } from './modules/websocket/websocket.module';
import { SeedModule } from './database/seed/seed.module';
import { SeedService } from './database/seed/seed.service';
import { HealthController } from './common/controllers/health.controller';

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
    WebsocketModule,
    RedisModule,
    EmailModule,
    AuthModule,
    TenantModule,
    MenuModule,
    TableModule,
    OrderModule,
    PaymentModule,
    AnalyticsModule,
    StaffModule,
    ReviewModule,
    PaymentConfigModule,
    PromotionModule,
    SubscriptionModule,
    SeedModule,
  ],
  controllers: [AppController, HealthController],
  providers: [
    AppService,
    // Make JwtAuthGuard global (optional, để protect tất cả routes by default)
    // {
    //   provide: APP_GUARD,
    //   useClass: JwtAuthGuard,
    // },
  ],
})
export class AppModule implements NestModule, OnModuleInit {
  private readonly logger = new Logger(AppModule.name);

  constructor(private readonly seedService: SeedService) {}

  async onModuleInit() {
    // Seed subscription plans on startup (idempotent - uses upsert)
    try {
      await this.seedService.seedSubscriptionPlans();
      this.logger.log('✅ Subscription plans seeded successfully');
    } catch (error) {
      this.logger.error('Failed to seed subscription plans:', error);
    }
  }

  configure(consumer: MiddlewareConsumer) {
    // Apply SessionMiddleware FIRST to populate request.session from cookie before any other middleware
    consumer.apply(SessionMiddleware).forRoutes('*');

    // Apply ArrayQueryMiddleware to transform status[] to status array
    consumer.apply(ArrayQueryMiddleware).forRoutes('*');

    // Apply RequestIdMiddleware globally
    consumer.apply(RequestIdMiddleware).forRoutes('*');

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
      .forRoutes('*');
  }
}
