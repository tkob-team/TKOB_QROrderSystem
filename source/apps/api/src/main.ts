import { NestFactory } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';
import { AppModule } from './app.module';
import { Logger } from 'nestjs-pino';
import { ConfigService } from '@nestjs/config';
import { EnvConfig } from './config/env.validation';

async function bootstrap() {
  const app = await NestFactory.create(AppModule, {
    bufferLogs: true,
  });

  // Sử dụng Pino logger toàn cục
  app.useLogger(app.get(Logger));

  app.setGlobalPrefix('api/v1', {
    exclude: ['/api/v1/*path'],
  });

  // Inject ConfigService với Generic Type <EnvConfig>
  const configService = app.get<ConfigService<EnvConfig, true>>(ConfigService);

  // Fix CORS config
  const corsOrigins = configService.get('CORS_ORIGINS', { infer: true });
  app.enableCors({
    origin: corsOrigins ? corsOrigins.split(',') : '*',
    credentials: true,
  });

  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
    }),
  );

  const port = configService.get('API_PORT', { infer: true });
  const nodeEnv = configService.get('NODE_ENV', { infer: true });

  // Swagger setup (chỉ enable trong development)
  if (nodeEnv === 'development') {
    const config = new DocumentBuilder()
      .setTitle('QR Ordering API')
      .setDescription('API Documentation for QR Ordering Platform')
      .setVersion('1.0')
      .addBearerAuth()
      .build();

    const document = SwaggerModule.createDocument(app, config);
    SwaggerModule.setup('api-docs', app, document);
  }

  await app.listen(port);

  const logger = app.get(Logger);
  logger.log(`Application is running on: http://localhost:${port}`);

  if (nodeEnv === 'development') {
    logger.log(`API Documentation: http://localhost:${port}/api-docs`);
  }
}

bootstrap();