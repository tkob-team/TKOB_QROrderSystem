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

  app.setGlobalPrefix('api/v1');
  app.enableCors({
    origin: process.env.CORS_ORIGINS?.split(',') || '*',
    credentials: true,
  });
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
    }),
  );

  // Inject ConfigService với Generic Type <EnvConfig>
  // true tham số thứ 2 báo cho TS biết là chắc chắn infer ra đúng type
  const configService = app.get<ConfigService<EnvConfig, true>>(ConfigService);

  // Lúc này:
  // port sẽ có kiểu 'number' (không phải string, không phải any)
  // IDE sẽ gợi ý code (Intellisense) khi gõ configService.get('...')
  const port = configService.get('API_PORT', { infer: true });

  // Swagger setup
  const options = new DocumentBuilder()
    .setTitle('API Documentation')
    .setDescription('API Documentation')
    .setVersion('1.0')
    .build();
  const document = SwaggerModule.createDocument(app, options);
  SwaggerModule.setup('/api-docs', app, document);

  await app.listen(port);

  app.get(Logger).log(`Application is running on: http://localhost:${port}`);
  app.get(Logger).log(`API Documentation: http://localhost:${port}/api-docs`);
}

bootstrap();