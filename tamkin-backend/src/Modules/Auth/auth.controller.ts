import {
  Body,
  Controller,
  Get,
  Post,
  Req,
  Res,
  UsePipes,
} from '@nestjs/common';
import { AuthService } from './auth.service';
import { GoogleLoginDto, LoginDto, RegisterDto } from './Dto/register.dto';
import { ValidationPipe } from '@nestjs/common';
import type { Request, Response } from 'express';
import { ResponseService } from 'src/Common/Services/Response/response.service';

@UsePipes(
  new ValidationPipe({
    forbidNonWhitelisted: true,
    whitelist: true,
    transform: true,
  }),
)
@Controller('auth')
export class AuthController {
  constructor(
    private readonly authService: AuthService,
    private readonly responseService: ResponseService,
  ) {}

  @Post('google')
  async loginWithGoogle(
    @Req() req: Request,
    @Res({ passthrough: true }) res: Response,
    @Body() body: GoogleLoginDto,
  ) {
    const { user, status } = await this.authService.loginWithGoogle(
      req,
      res,
      body,
    );
    return this.responseService.success({
      message:
        status === 'register'
          ? req.t('auth:messages.registeredSuccessfully')
          : req.t('auth:messages.loggedSuccessfully'),
      info: req.t('auth:messages.credentialsSavedInCookiesSuccessfully'),
      data: {
        user,
        status,
      },
    });
  }

  @Post('register')
  async register(
    @Req() req: Request,
    @Res({ passthrough: true }) res: Response,
    @Body() body: RegisterDto,
  ) {
    const { user } = await this.authService.register(req, res, body);

    return this.responseService.success({
      message: req.t('auth:messages.registeredSuccessfully'),
      info: req.t('auth:messages.credentialsSavedInCookiesSuccessfully'),
      data: {
        user,
      },
    });
  }

  @Post('login')
  async login(
    @Req() req: Request,
    @Res({ passthrough: true }) res: Response,
    @Body() body: LoginDto,
  ) {
    const { user } = await this.authService.login(req, res, body);

    return this.responseService.success({
      message: req.t('auth:messages.loggedSuccessfully'),
      info: req.t('auth:messages.credentialsSavedInCookiesSuccessfully'),
      data: {
        user,
      },
    });
  }

  @Post('logout')
  async logout(@Req() req: Request, @Res({ passthrough: true }) res: Response) {
    await this.authService.logout(req, res);

    return this.responseService.success({
      message: req.t('auth:success.loggedOutSuccessfully'),
    });
  }
}
