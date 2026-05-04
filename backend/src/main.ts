import { NestFactory } from '@nestjs/core';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';
import { ValidationPipe } from '@nestjs/common';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  // Global configuration
  app.setGlobalPrefix('api');
  app.enableCors({
    origin: process.env.CORS_ORIGIN?.split(',') || '*',
    credentials: true,
  });

  // Global validation pipe
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
      transformOptions: { enableImplicitConversion: true },
    }),
  );

  // Swagger API Documentation
  const config = new DocumentBuilder()
    .setTitle('Real Estate API')
    .setDescription('Production-grade Real Estate Platform with Geospatial Intelligence')
    .setVersion('1.0.0')
    .addBearerAuth()
    .addTag('auth', 'Authentication endpoints')
    .addTag('properties', 'Property management endpoints')
    .addTag('users', 'User management endpoints')
    .addTag('geospatial', 'Geospatial intelligence endpoints')
    .addTag('search', 'Search and discovery endpoints')
    .addTag('analytics', 'Analytics and insights endpoints')
    .build();

  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api/docs', app, document);

  const port = parseInt(process.env.APP_PORT || '3000', 10);
  await app.listen(port, () => {
    console.log(`🚀 Real Estate API is running on: http://localhost:${port}`);
    console.log(`📚 Swagger documentation: http://localhost:${port}/api/docs`);
  });
}

bootstrap().catch((error) => {
  console.error('Failed to start application:', error);
  process.exit(1);
});
