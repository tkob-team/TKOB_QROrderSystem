import { NestFactory } from '@nestjs/core';
import { ValidationPipe, Logger } from '@nestjs/common';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';
import { AppModule } from './app.module';
import { ConfigService } from '@nestjs/config';
import type { EnvConfig } from './config/env.validation';
import cookieParser from 'cookie-parser';

// Import filters
import { AllExceptionsFilter } from './common/filters/all-exceptions.filter';
import { HttpExceptionFilter } from './common/filters/http-exception.filter';
import { PrismaExceptionFilter } from './common/filters/prisma-exception.filter';

// Import interceptors
import { LoggingInterceptor } from './common/interceptors/logging.interceptor';
import { TransformInterceptor } from './common/interceptors/transform.interceptor';
import { TimeoutInterceptor } from './common/interceptors/timeout.interceptor';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  // Production logging level
  const logLevels: ('log' | 'error' | 'warn' | 'debug' | 'verbose')[] =
    process.env.NODE_ENV === 'production'
      ? ['log', 'error', 'warn']
      : ['log', 'error', 'warn', 'debug', 'verbose'];

  app.useLogger(logLevels);

  // Get config service
  const configService = app.get<ConfigService<EnvConfig, true>>(ConfigService);
  const port = configService.get('API_PORT', { infer: true }) || 3000;
  const nodeEnv = configService.get('NODE_ENV', { infer: true });

  // ==================== COOKIE PARSER ====================
  app.use(cookieParser());

  // ==================== GLOBAL PREFIX ====================
  app.setGlobalPrefix('api/v1', {
    exclude: ['/health', '/'], // Health check endpoints
  });

  // ==================== CORS ====================
  const corsOrigins = configService.get('CORS_ORIGINS', { infer: true });
  const allowedOrigins = corsOrigins
    ? corsOrigins.split(',').map((origin) => origin.trim())
    : ['http://localhost:3001', 'http://localhost:3002', 'http://localhost:3000'];

  app.enableCors({
    origin: allowedOrigins,
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization', 'Cookie', 'x-tenant-id'],
    exposedHeaders: ['Set-Cookie'],
  });

  // ==================== EXCEPTION FILTERS ====================
  app.useGlobalFilters(
    new AllExceptionsFilter(),
    new HttpExceptionFilter(),
    new PrismaExceptionFilter(),
  );

  // ==================== INTERCEPTORS ====================
  // Tăng timeout lên 60s cho production
  app.useGlobalInterceptors(
    new LoggingInterceptor(),
    new TransformInterceptor(),
    new TimeoutInterceptor(process.env.NODE_ENV === 'production' ? 60000 : 30000), // 60s for prod
  );

  // ==================== VALIDATION ====================
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
      transformOptions: {
        enableImplicitConversion: true,
      },
    }),
  );

  // ==================== SWAGGER (Development only) ====================
  if (nodeEnv === 'development' || nodeEnv === 'production') {
    const config = new DocumentBuilder()
      .setTitle('QR Ordering API')
      .setDescription('API Documentation for QR Ordering Platform')
      .setVersion('1.0')
      .addBearerAuth()
      .addCookieAuth('table_session_id')
      .addTag('Authentication', 'User authentication & registration')
      .addTag('Tenants', 'Restaurant/tenant management')
      .addTag('Menu - Categories', 'Menu categories management')
      .addTag('Menu - Items', 'Menu items management')
      .addTag('Menu - Modifiers', 'Menu item modifiers management')
      .addTag('Menu - Photos', 'Menu photo management')
      .addTag('Menu - Public', 'Menu public management')
      .addTag('Tables', 'Table management & QR codes')
      .addTag('Tables - Public', 'Table QR code scanning and session management')
      .addTag('Cart', 'Customer cart management')
      .addTag('Orders', 'Order placement & management')
      .addTag('Payments', 'Payment processing')
      .build();

    const document = SwaggerModule.createDocument(app, config);
    SwaggerModule.setup('api-docs', app, document, {
      swaggerOptions: {
        persistAuthorization: true,
      },
    });
  }

  // ==================== HEALTH CHECK ENDPOINT ====================
  // Render uses this to check if the service is healthy

  // ==================== START SERVER ====================
  await app.listen(port, '0.0.0.0'); // Bind to all interfaces for Render

  Logger.log(`🚀 Application is running on port ${port}`, 'Bootstrap');
  Logger.log(`📝 Environment: ${nodeEnv}`, 'Bootstrap');

  if (nodeEnv === 'development') {
    Logger.log(`📚 API Documentation: http://localhost:${port}/api-docs`, 'Bootstrap');
  }
}

bootstrap().catch((err) => {
  Logger.error('NestJS bootstrap error:', err);
  process.exit(1);
});
