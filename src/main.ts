import { NestFactory } from '@nestjs/core';
import { MicroserviceOptions } from '@nestjs/microservices';
import { AppModule } from './app.module';
import { TronwebNodeStrategy } from './tronweb/tronweb.strategy';

async function bootstrap() {
  const app = await NestFactory.createMicroservice<MicroserviceOptions>(
    AppModule,
    {
      strategy: new TronwebNodeStrategy(),
    },
  );
  await app.listen();
}
bootstrap();