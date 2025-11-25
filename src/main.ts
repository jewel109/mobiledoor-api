import { NestFactory } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common';
import { AppModule } from './app.module';
import { SuccessInterceptor } from './success.interceptor';
import { CatchEverythingFilter } from './error.interceptor';
import helmet from 'helmet';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  // Global pipes
  app.useGlobalPipes(new ValidationPipe({
    whitelist: true,
    forbidNonWhitelisted: true,
    transform: true,
  }));

  // Global interceptors
  app.useGlobalInterceptors(new SuccessInterceptor());

  // Global filters
  app.useGlobalFilters(new CatchEverythingFilter());

  // Security
  app.use(helmet());

  // CORS
  app.enableCors({
    origin: [
      process.env.FRONTEND_URL,
      'http://localhost:3000',
      'http://localhost:3001',
      'http://localhost:3002',
      'http://148.113.209.36:3000',
      'http://148.113.209.36:3001',
      'http://148.113.209.36:3002',
    ].filter(Boolean),
    credentials: true,
  });

  const port = process.env.PORT ?? 3001;
  await app.listen(port);
  console.log(`MobileDoor API running on port ${port}`);
}
bootstrap();