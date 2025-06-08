import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
    app.enableCors({
    origin: process.env.CORS_ORIGIN, // Allow all origins by default, can be overridden by environment variable
    methods: 'GET,HEAD,PUT,PATCH,POST,DELETE',
    credentials: true, // Allow credentials if needed
  });
  await app.listen(process.env.PORT ?? 8800);
  console.log(`Server is running on port ${process.env.PORT ?? 8800}`);
  console.log(`CORS enabled for origin: ${process.env.CORS_ORIGIN || 'all'}`);
}
bootstrap();
