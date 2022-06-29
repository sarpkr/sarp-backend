import { ValidationPipe, VersioningType } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { NestFactory } from '@nestjs/core';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';

import * as cookieParser from 'cookie-parser';
import * as compression from 'compression';
import helmet from 'helmet';

import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  const configService = app.get(ConfigService);
  const port = configService.get('PORT');
  const isDev = configService.get('NODE_ENV') === 'development';

  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
    }),
  );

  app.enableVersioning({
    type: VersioningType.URI,
  });

  app.enableCors({
    credentials: true,
    origin: isDev ? configService.get('FRONT_URI') : undefined,
  });

  app.use(compression());
  app.use(helmet());
  app.use(cookieParser());

  if (isDev) {
    const config = new DocumentBuilder()
      .setTitle('real estate api')
      .setDescription('The Real estate API description')
      .setVersion('1.0.0')
      .addBearerAuth()
      .build();
    const document = SwaggerModule.createDocument(app, config);
    SwaggerModule.setup('/v1/api', app, document);
  }

  await app.listen(port);
}
bootstrap();
