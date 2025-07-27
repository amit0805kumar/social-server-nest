import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';

async function bootstrap() {
  const allowedOrigins = process.env.CORS_ORIGIN?.split(',') || [];
  const app = await NestFactory.create(AppModule);
  app.enableCors({
    origin: (origin, callback) => {
      // Allow requests with no origin like mobile apps or curl
      if (!origin) return callback(null, true);

      if (allowedOrigins.includes(origin)) {
        callback(null, true);
      } else {
        callback(new Error('Not allowed by CORS'));
      }
    },
    methods: 'GET,HEAD,PUT,PATCH,POST,DELETE',
    credentials: true, // Allow credentials if needed
  });
  await app.listen(process.env.PORT ?? 8800);
  console.log(`Server is running on port ${process.env.PORT ?? 8800}`);
  console.log(`CORS enabled for origin: ${process.env.CORS_ORIGIN || 'all'}`);
}
bootstrap();
