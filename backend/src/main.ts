import * as fs from 'fs';

import { NestFactory } from '@nestjs/core';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';

import { AppModule } from './app.module';

async function bootstrap() {
  let app: any;
  if (process.env.HTTPS === 'true') {
    const httpsOptions = {
      key: fs.readFileSync('./key.pem'),
      cert: fs.readFileSync('./cert.pem'),
      ca: [
        fs.readFileSync('./1.pem'),
        fs.readFileSync('./2.pem'),
        fs.readFileSync('./3.pem'),
      ],
    };
    app = await NestFactory.create(AppModule, {
      httpsOptions,
      logger: ['error', 'debug'],
    });
  } else {
    app = await NestFactory.create(AppModule);
  }

  const config = new DocumentBuilder()
    .setTitle('HUSL Documentation')
    .setDescription('HUSL API documentation')
    .setVersion('0.1')
    .addTag('crypto')
    .build();
  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api', app, document);

  app.enableCors({
    origin: '*',
    methods: 'GET,HEAD,PUT,PATCH,POST,DELETE,OPTIONS',
    allowedHeaders:
      'X-Requested-With, X-HTTP-Method-Override, Observe, Content-Type, Accept, Authorization, ga_token, ga_refresh_token, x-authorize-token',
    credentials: true,
  });

  await app.listen(process.env.HTTP_PORT || 3000);
}
bootstrap();
