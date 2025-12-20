import { NestFactory, Reflector } from '@nestjs/core';
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
  const app = await NestFactory.create(AppModule, {
    bufferLogs: true,
  });

  app.useLogger(['log', 'error', 'warn', 'debug', 'verbose']);

  // Get config service
  const configService = app.get<ConfigService<EnvConfig, true>>(ConfigService);
  const port = configService.get('API_PORT', { infer: true });
  const nodeEnv = configService.get('NODE_ENV', { infer: true });

  // ==================== COOKIE PARSER ====================
  // Required for session-based QR ordering (Haidilao style)
  app.use(cookieParser());

  // ==================== GLOBAL PREFIX ====================
  app.setGlobalPrefix('api/v1', {
    exclude: ['/health'], // Health check endpoint
  });

  // ==================== CORS ====================
  const corsOrigins = configService.get('CORS_ORIGINS', { infer: true });
  const allowedOrigins = corsOrigins 
    ? corsOrigins.split(',') 
    : ['http://localhost:3001', 'http://localhost:3002', 'http://localhost:3000']; // Default for development
  
  app.enableCors({
    origin: allowedOrigins,
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization', 'Cookie'],
    exposedHeaders: ['Set-Cookie'],
  });

  // ==================== EXCEPTION FILTERS ====================
  // Order matters: Most specific first, most general last
  const _reflector = app.get(Reflector);

  app.useGlobalFilters(
    new AllExceptionsFilter(), // Catch-all (fallback)
    new HttpExceptionFilter(), // HTTP exceptions
    new PrismaExceptionFilter(), // Prisma database errors
  );

  // ==================== INTERCEPTORS ====================
  app.useGlobalInterceptors(
    new LoggingInterceptor(), // Log requests/responses
    new TransformInterceptor(), // Transform success responses
    new TimeoutInterceptor(30000), // 30s timeout
  );

  // ==================== VALIDATION ====================
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true, // Strip unknown properties
      forbidNonWhitelisted: true, // Throw error on unknown properties
      transform: true, // Auto-transform types
      transformOptions: {
        enableImplicitConversion: true, // Convert strings to numbers, etc.
      },
    }),
  );

  // ==================== SWAGGER (Development only) ====================
  if (nodeEnv === 'development') {
    const config = new DocumentBuilder()
      .setTitle('QR Ordering API')
      .setDescription('API Documentation for QR Ordering Platform')
      .setVersion('1.0')
      .addBearerAuth()
      .addTag('Authentication', 'User authentication & registration')
      .addTag('Tenants', 'Restaurant/tenant management')
      .addTag('Menu - Categories', 'Menu categories management')
      .addTag('Menu - Items', 'Menu items management')
      .addTag('Menu - Modifiers', 'Menu item modifiers management')
      .addTag('Menu - Public', 'Menu public management')
      .addTag('Tables', 'Table management & QR codes')
      .addTag('Orders', 'Order placement & management')
      .addTag('Payments', 'Payment processing')
      .build();

    const document = SwaggerModule.createDocument(app, config);
    SwaggerModule.setup('api-docs', app, document, {
      swaggerOptions: {
        persistAuthorization: true, // Remember auth token
      },
    });
  }

  // ==================== START SERVER ====================
  await app.listen(port);

  Logger.log(`🚀 Application is running on: http://localhost:${port}`, 'Bootstrap');
  Logger.log(`📝 Environment: ${nodeEnv}`, 'Bootstrap');

  if (nodeEnv === 'development') {
    Logger.log(`📚 API Documentation: http://localhost:${port}/api-docs`, 'Bootstrap');
  }
}

bootstrap().catch((err) => {
  Logger.error('NestJS bootstrap error:', err);
});
