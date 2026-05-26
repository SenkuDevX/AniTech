import { NestFactory } from '@nestjs/core';
import { ValidationPipe, VersioningType } from '@nestjs/common';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';
import helmet from 'helmet';
import compression from 'compression';
import cookieParser from 'cookie-parser';
import { AppModule } from './app.module';
import { TransformInterceptor } from './common/interceptors/transform.interceptor';
import { AllExceptionsFilter } from './common/filters/exceptions.filter';

async function bootstrap() {
  const app = await NestFactory.create(AppModule, {
    logger: ['error', 'warn', 'log', 'debug', 'verbose'],
  });

  // Security
  app.use(helmet());
  app.use(compression());
  app.use(cookieParser());

  // CORS
  app.enableCors({
    origin: process.env.FRONTEND_URL || 'http://localhost:3000',
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With'],
  });

  // API Versioning
  app.enableVersioning({
    type: VersioningType.URI,
    defaultVersion: '1',
  });

  // Global exception filter
  app.useGlobalFilters(new AllExceptionsFilter());

  // Global interceptor
  app.useGlobalInterceptors(new TransformInterceptor());

  // Validation
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

  // OpenAPI Documentation
  const config = new DocumentBuilder()
    .setTitle('AniTech API')
    .setDescription('The AniTech OS Backend API')
    .setVersion('0.1.0')
    .addBearerAuth()
    .addTag('Auth', 'Authentication & Session Management')
    .addTag('Users', 'User Profiles & Management')
    .addTag('Anime', 'Anime Metadata & Discovery')
    .addTag('Watchlist', 'Watchlist & Progress Tracking')
    .addTag('Player', 'Playback State & History')
    .addTag('Search', 'Intelligent Search System')
    .addTag('Social', 'Social Features & Interactions')
    .addTag('WatchParty', 'Synchronized Watch Parties')
    .addTag('Notifications', 'Real-time Notifications')
    .addTag('Plugins', 'Plugin Ecosystem')
    .addTag('Themes', 'Theme System')
    .addTag('Downloads', 'Download Management')
    .addTag('LocalMedia', 'Local Media Library')
    .addTag('Settings', 'User Preferences')
    .addTag('Recommendations', 'Personalized Recommendations')
    .addTag('Achievements', 'Gamification & Achievements')
    .addTag('Health', 'System Health & Diagnostics')
    .build();
  
  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api/docs', app, document);

  // Graceful shutdown
  app.enableShutdownHooks();

  const port = process.env.PORT || 4000;
  await app.listen(port);
  
  console.log(`AniTech API running on: http://localhost:${port}`);
  console.log(`API Docs: http://localhost:${port}/api/docs`);
}

bootstrap();