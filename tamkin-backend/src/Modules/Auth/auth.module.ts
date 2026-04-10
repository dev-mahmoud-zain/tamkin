import { Module } from '@nestjs/common';
import { AuthService } from './auth.service';
import { AuthController } from './auth.controller';
import { GoogleAuth } from './Google-Auth/google.auth';
import { CommonModule } from '../../Common/Common-Module/common-module';
import { TokenService } from 'src/Common/Utils/Security/token.service';
import { CookiesService } from 'src/Common/Cookies/cookies.service';

@Module({
  imports: [
    CommonModule,
  ],
  controllers: [AuthController],
  providers: [AuthService,GoogleAuth,TokenService,CookiesService],
  exports: [GoogleAuth]
})
export class AuthModule { }
