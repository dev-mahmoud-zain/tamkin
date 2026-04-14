import { Injectable } from '@nestjs/common';
import { GoogleLoginDto, LoginDto, RegisterDto } from './Dto/register.dto';
import { ResponseService } from 'src/Common/Services/Response/response.service';
import { GoogleAuthService } from './Google-Auth/google.auth';
import { UserModel } from 'src/DataBase/Models/user.model';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Request, Response } from 'express';
import { TokenTypeEnum } from 'src/Common/Enums/token.enum';
import { CookiesService } from 'src/Common/Services/Cookies/cookies.service';
import { UserProviderEnum } from 'src/Common/Enums/User/user.enum';
import countries from 'i18n-iso-countries';
import { TokenService } from 'src/Common/Services/Security/token.service';
import { ClientInfoService } from 'src/Common/Services/Security/client-info.service';
import { HashingService } from 'src/Common/Services/Security/Hash/hash.service';

@Injectable()
export class AuthService {
  constructor(
    private readonly responseService: ResponseService,
    private readonly googleAuth: GoogleAuthService,
    @InjectRepository(UserModel)
    private readonly userModel: Repository<UserModel>,
    private readonly tokenService: TokenService,
    private readonly clientInfoService: ClientInfoService,
    private readonly cookiesService: CookiesService,
    private readonly hashingService: HashingService,
  ) {}

  async loginWithGoogle(req: Request, res: Response, body: GoogleLoginDto) {
    const { email, picture, given_name, family_name } =
      await this.googleAuth.verifyGmailAccount(body.id_token, req);

    let user = await this.userModel.findOne({
      where: { email },
    });

    let status: 'login' | 'register' = 'login';

    if (!user) {
      status = 'register';

      const newUser: UserModel = await this.userModel.save({
        email,
        firstName: given_name,
        lastName: family_name,
        picture,
        provider: UserProviderEnum.GOOGLE,
      });

      if (!newUser) {
        throw this.responseService.serverError({
          message: req.t('auth:errors.failToCreateUser'),
          info: req.t('auth:errors.somethingWentWrongPleaseTryAgain'),
        });
      }

      user = newUser;
    }

    const tokens = await this.tokenService.createLoginCredentials(
      user.uuid,
      user.role,
    );

    const session = this.clientInfoService.getUserSessionContext(req);

    Promise.all([
      this.tokenService.saveJwt(
        user.uuid,
        tokens.access_token.jti,
        tokens.access_token.token,
        TokenTypeEnum.ACCESS,
        session,
      ),

      this.tokenService.saveJwt(
        user.uuid,
        tokens.refresh_token.jti,
        tokens.refresh_token.token,
        TokenTypeEnum.REFRESH,
        session,
      ),
    ]);

    this.cookiesService.setTokenToCookies(
      res,
      tokens.access_token.token,
      TokenTypeEnum.ACCESS,
    );
    this.cookiesService.setTokenToCookies(
      res,
      tokens.refresh_token.token,
      TokenTypeEnum.REFRESH,
    );

    return {
      user,
      status,
    };
  }

  async register(req: Request, res: Response, body: RegisterDto) {
    let user = await this.userModel.findOne({
      where: { email: body.email },
    });

    if (user) {
      throw this.responseService.badRequest({
        message: req.t('auth:errors.emailAlreadyExists'),
        info: req.t('auth:errors.thisAccountIsAlreadyRegisteredPleaseLogin'),
      });
    }

    if (body.password !== body.confirmPassword) {
      throw this.responseService.badRequest({
        message: req.t('auth:errors.passwordsNotMatch'),
      });
    }

    const newUser: UserModel = await this.userModel.save({
      email: body.email,
      password: await this.hashingService.hashPassword(body.password),
      firstName: body.fullName.split(' ')[0],
      lastName: body.fullName.split(' ')[1],
      nationality: countries.getName(body.nationality, 'en'),
      provider: UserProviderEnum.SYSTEM,
      test: 'sss',
    });

    if (!newUser) {
      throw this.responseService.serverError({
        message: req.t('auth:errors.failToCreateUser'),
        info: req.t('auth:errors.somethingWentWrongPleaseTryAgain'),
      });
    }

    const tokens = await this.tokenService.createLoginCredentials(
      newUser.uuid,
      newUser.role,
    );

    const session = this.clientInfoService.getUserSessionContext(req);

    Promise.all([
      this.tokenService.saveJwt(
        newUser.uuid,
        tokens.access_token.jti,
        tokens.access_token.token,
        TokenTypeEnum.ACCESS,
        session,
      ),

      this.tokenService.saveJwt(
        newUser.uuid,
        tokens.refresh_token.jti,
        tokens.refresh_token.token,
        TokenTypeEnum.REFRESH,
        session,
      ),
    ]);

    this.cookiesService.setTokenToCookies(
      res,
      tokens.access_token.token,
      TokenTypeEnum.ACCESS,
    );
    this.cookiesService.setTokenToCookies(
      res,
      tokens.refresh_token.token,
      TokenTypeEnum.REFRESH,
    );

    return {
      user: newUser,
    };
  }

  async login(req: Request, res: Response, body: LoginDto) {
    let user = await this.userModel.findOne({
      where: { email: body.email },
    });

    if (!user || !user.password) {
      throw this.responseService.badRequest({
        message: req.t('auth:errors.invalidCredentials'),
        info: req.t('auth:errors.invalidCredentialsInfo'),
      });
    }

    if (!(await this.hashingService.compare(body.password, user.password))) {
      throw this.responseService.badRequest({
        message: req.t('auth:errors.invalidCredentials'),
        info: req.t('auth:errors.invalidCredentialsInfo'),
      });
    }

    const tokens = await this.tokenService.createLoginCredentials(
      user.uuid,
      user.role,
    );

    const session = this.clientInfoService.getUserSessionContext(req);

    Promise.all([
      this.tokenService.saveJwt(
        user.uuid,
        tokens.access_token.jti,
        tokens.access_token.token,
        TokenTypeEnum.ACCESS,
        session,
      ),

      this.tokenService.saveJwt(
        user.uuid,
        tokens.refresh_token.jti,
        tokens.refresh_token.token,
        TokenTypeEnum.REFRESH,
        session,
      ),
    ]);

    this.cookiesService.setTokenToCookies(
      res,
      tokens.access_token.token,
      TokenTypeEnum.ACCESS,
    );
    this.cookiesService.setTokenToCookies(
      res,
      tokens.refresh_token.token,
      TokenTypeEnum.REFRESH,
    );

    return {
      user,
    };
  }
  async logout(req: Request, res: Response) {
    const access_token = req.cookies['access_token'];
    const refresh_token = req.cookies['refresh_token'];

    await this.tokenService.revokeSessionTokens(access_token, refresh_token);

    this.cookiesService.removeTokenFromCookies(res, TokenTypeEnum.ACCESS);
    this.cookiesService.removeTokenFromCookies(res, TokenTypeEnum.REFRESH);
  }
}
