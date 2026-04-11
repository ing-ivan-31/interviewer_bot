import { NestFactory } from '@nestjs/core';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';
import { AppModule } from './app.module';
import { HttpExceptionFilter } from './common/filters/http-exception.filter';

async function bootstrap(): Promise<void> {
  const app = await NestFactory.create(AppModule);

  // Global exception filter for standardized error responses
  app.useGlobalFilters(new HttpExceptionFilter());

  // Swagger configuration (development only)
  if (process.env.NODE_ENV !== 'production') {
    const config = new DocumentBuilder()
      .setTitle('JS/React Interviewer Evaluator API')
      .setDescription('API for AI-powered technical interview evaluation')
      .setVersion('1.0')
      .addTag('agent', 'Interview session management')
      .addBearerAuth()
      .build();

    const document = SwaggerModule.createDocument(app, config);
    SwaggerModule.setup('api/docs', app, document, {
      swaggerOptions: {
        persistAuthorization: true,
      },
    });
  }

  await app.listen(process.env.PORT ?? 3001);
}
bootstrap();
