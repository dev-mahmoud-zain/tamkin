import { Body, Controller, Post, Req, Res, UsePipes } from '@nestjs/common';
import { AuthService } from './auth.service';
import { LoginDto } from './Dto/register.dto';
import { ValidationPipe } from '@nestjs/common';
import { SuccessResponse } from 'src/Common/Utils/Response/success.response';
import type { Request, Response } from 'express';

@UsePipes(new ValidationPipe({
  forbidNonWhitelisted: true,
  whitelist: true,
  transform: true,
}))

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) { }

  @Post('google')
  async loginWithGoogle(
    @Req() req: Request,
    @Res({ passthrough: true }) res: Response,
    @Body() body: LoginDto) {
    const { user, status } = await this.authService.loginWithGoogle(req, res, body);
    return SuccessResponse({
      message: status === "register" ? "registered successfully" : "logged in successfully",
      data: {
        user,
        status
      }
    });
  }

  @Post('facebook')
  async loginWithFacebook(
    @Req() req: Request,
    @Res({ passthrough: true }) res: Response,
    @Body() body: LoginDto) {
    await this.authService.loginWithFacebook(req, res, body);
    return SuccessResponse({
      message: "logged in successfully",
      data: {
        user: "temp",
        status: "login"
      }
    });
  }



}