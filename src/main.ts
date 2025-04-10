import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import AppConfig from './config/app.config';

async function bootstrap() {
  console.log(AppConfig.MONGO_URI);
  const app = await NestFactory.create(AppModule);
  await app.listen(AppConfig.PORT);
}
void bootstrap();
