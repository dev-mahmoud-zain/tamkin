import { NestFactory, Reflector } from '@nestjs/core';
import { AppModule } from './app.module';
import { ResponseStatusInterceptor } from './Common/Interceptors/response.status.interceptor';
import cookieParser from 'cookie-parser';
import helmet from 'helmet';
import { CustomValidationPipe } from './Common/Pipes/custom.validation.pipe';
import { ClassSerializerInterceptor, ValidationPipe } from '@nestjs/common';
import { ErrorResponse } from './Common/Utils/Response/error.response';
import middleware from 'i18next-http-middleware';
import i18next from 'i18next';
import { i18nInit } from './Config/i18n';


async function bootstrap() {
  await i18nInit();
  const app = await NestFactory.create(AppModule);

  app.use(helmet());

  app.use(middleware.handle(i18next));

  app.getHttpAdapter().getInstance().disable('x-powered-by');

  app.enableCors({
    origin: ['http://localhost:4200'],
    methods: 'GET,HEAD,PUT,PATCH,POST,DELETE',
    credentials: true,
  });

  app.use(cookieParser());

  app.useGlobalPipes(new CustomValidationPipe(new ErrorResponse()));

  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
    }),
  );

  app.useGlobalInterceptors(
    new ClassSerializerInterceptor(app.get(Reflector)),
  );

  app.useGlobalInterceptors(new ResponseStatusInterceptor());

  await app.listen(process.env.BACKEND_PORT ?? 3000);
}
bootstrap();