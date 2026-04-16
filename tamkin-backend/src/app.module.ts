import {
  MiddlewareConsumer,
  Module,
  NestModule,
  OnApplicationBootstrap,
} from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ServeStaticModule } from '@nestjs/serve-static';
import { join } from 'path';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { DataSource } from 'typeorm';
import { AuthModule } from './Modules/Auth/auth.module';
import { CommonModule } from './Common/common.module';
import { TypeORMConfig } from './Config/typeorm.config';
import { CampaignModule } from './Modules/Campaign/campaign.module';
import { LanguageMiddleware } from './Middlewares/language.middleware';
import { JsonFileService } from './Common/Services/Json/json-file.service';
import { APP_PIPE } from '@nestjs/core';
import { CustomValidationPipe } from './Common/Pipes/custom.validation.pipe';
import { TranslationService } from './Common/Services/Translation/translation.service';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: '.env',
    }),
    TypeOrmModule.forRootAsync(TypeORMConfig),
    CommonModule,
    AuthModule,
    CampaignModule,
    ServeStaticModule.forRoot({
      rootPath: join(__dirname, '..', 'assets', 'pictures'),
      serveRoot: '/pictures',
    }),
  ],
  controllers: [AppController],
  providers: [
    AppService,
    JsonFileService,
    TranslationService,
    {
      provide: APP_PIPE,
      useClass: CustomValidationPipe,
    },
  ],
})
export class AppModule implements OnApplicationBootstrap {
  configure(consumer: MiddlewareConsumer) {
    consumer.apply(LanguageMiddleware).forRoutes('*');
  }
  constructor(private dataSource: DataSource) {}

  async onApplicationBootstrap() {
    if (this.dataSource.isInitialized) {
      console.log('Database connected successfully 🟢 ');
    } else {
      console.log('Fail To connect to database 🔴 ');
    }
  }
}
