import { Inject, Injectable, Scope } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import jwt, { sign } from 'jsonwebtoken';
import { In, Repository } from 'typeorm';
import { TokenTypeEnum } from 'src/Common/Enums/token.enum';
import { JwtModel } from 'src/DataBase/Models/jwt.model';
import { UserModel } from '../../../DataBase/Models/user.model';
import { UserRoleEnum } from '../../Enums/User/user.enum';
import { ISignToken, IDecoded } from '../../Types/token.types';
import { SignatureLevelEnum } from '../../Enums/User/signature.level.enum';
import { ResponseService } from '../Response/response.service';
import { TranslationService } from '../Translation/translation.service';
import { HashingService } from './Hash/hash.service';
import { ISession } from 'src/Common/Interfaces/Security/client-info.interface';
import type { IRequest } from 'src/Common/Types/request.types';

@Injectable({ scope: Scope.REQUEST })
export class TokenService {
  constructor(
    private readonly hashingService: HashingService,
    private readonly responseService: ResponseService,
    @InjectRepository(JwtModel)
    private readonly jwtRepository: Repository<JwtModel>,
    @InjectRepository(UserModel)
    private readonly userRepository: Repository<UserModel>,
    @Inject('REQUEST')
    private readonly request: IRequest,
  ) {}

  private getSecretKey(
    tokenType: TokenTypeEnum,
    signature: SignatureLevelEnum,
  ): string {
    let key: string | undefined;

    switch (tokenType) {
      case TokenTypeEnum.ACCESS:
        switch (signature) {
          case SignatureLevelEnum.SUPER_ADMIN:
            key = process.env.SUPER_ADMIN_ACCESS_TOKEN_SECRET;
            break;
          case SignatureLevelEnum.ADMIN:
            key = process.env.ADMIN_ACCESS_TOKEN_SECRET;
            break;
          case SignatureLevelEnum.USER:
            key = process.env.USER_ACCESS_TOKEN_SECRET;
            break;
        }
        break;
      case TokenTypeEnum.REFRESH:
        switch (signature) {
          case SignatureLevelEnum.SUPER_ADMIN:
            key = process.env.SUPER_ADMIN_REFRESH_TOKEN_SECRET;
            break;
          case SignatureLevelEnum.ADMIN:
            key = process.env.ADMIN_REFRESH_TOKEN_SECRET;
            break;
          case SignatureLevelEnum.USER:
            key = process.env.USER_REFRESH_TOKEN_SECRET;
            break;
        }
        break;
    }

    if (!key) {
      throw this.responseService.serverError({
        message: 'token:errors.secret_key_missing',
      });
    }

    return key;
  }

  private async signToken(data: ISignToken) {
    let SECRET_KEY: string = this.getSecretKey(
      data.tokenType,
      data.payload.signature,
    );

    const ACCESS_TOKEN_EXPIRES =
      process.env.NODE_ENV === 'Development'
        ? (process.env.ACCESS_TOKEN_EXPIRES_DEV_MOOD ?? '24h')
        : (process.env.ACCESS_TOKEN_EXPIRES ?? '1h');

    const REFRESH_TOKEN_EXPIRES = process.env.REFRESH_TOKEN_EXPIRES ?? '7h';

    const expiresIn =
      data.tokenType === TokenTypeEnum.ACCESS
        ? ACCESS_TOKEN_EXPIRES
        : REFRESH_TOKEN_EXPIRES;

    const jti = crypto.randomUUID();

    return {
      token: sign(data.payload, SECRET_KEY, {
        expiresIn: expiresIn as any,
        jwtid: jti,
      }),
      jti,
    };
  }

  async createLoginCredentials(userId: string, role: UserRoleEnum) {
    let signature: SignatureLevelEnum = SignatureLevelEnum.USER;

    switch (role) {
      case UserRoleEnum.SUPER_ADMIN:
        signature = SignatureLevelEnum.SUPER_ADMIN;
        break;

      case UserRoleEnum.ADMIN:
        signature = SignatureLevelEnum.ADMIN;
        break;

      default:
        signature = SignatureLevelEnum.USER;
        break;
    }

    const access_token = await this.signToken({
      payload: {
        userId,
        role,
        signature,
      },
      tokenType: TokenTypeEnum.ACCESS,
    });

    const refresh_token = await this.signToken({
      payload: {
        userId,
        role,
        signature,
      },
      tokenType: TokenTypeEnum.REFRESH,
    });

    return {
      access_token: {
        token: `${signature} ${access_token.token}`,
        jti: access_token.jti,
      },

      refresh_token: {
        token: `${signature} ${refresh_token.token}`,
        jti: refresh_token.jti,
      },
    };
  }

  async saveJwt(
    userId: string,
    jti: string,
    token: string,
    type: TokenTypeEnum,
    session: ISession,
  ) {
    const expiresAt =
      type === TokenTypeEnum.ACCESS
        ? new Date(
            Date.now() +
              (process.env.NODE_ENV === 'Development'
                ? 24 * 60 * 60 * 1000
                : 60 * 60 * 1000),
          )
        : new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);

    await this.jwtRepository.save({
      userId,
      token: await this.hashingService.generateHash({text:token}),
      type,
      jti,
      ipAddress: session.ipAddress,
      deviceInfo: session.deviceInfo,
      userAgent: session.userAgent,
      expiresAt,
    });
  }

  private verifyToken = async (
    token: string,
    secretKey: string,
  ): Promise<IDecoded> => {
    try {
      return jwt.verify(token, secretKey) as IDecoded;
    } catch (error: any) {
      throw this.responseService.unauthorized({
        message: 'auth:errors.token_validation_failed',
        info: error.message,
      });
    }
  };

  private async revokeAllTokensForUser(filter: { userId: string }) {
    await this.jwtRepository.update(
      {
        userId: filter.userId,
      },
      {
        revoked: true,
        revokedAt: new Date(),
      },
    );
  }

  async revokeSessionTokens(access_token?: string, refresh_token?: string) {
    const tokensToRevoke: string[] = [];

    const decodeJti = (token: string) => {
      try {
        const tokenPart = token.includes(' ') ? token.split(' ').pop() : token;
        if (!tokenPart) return null;
        const payload = jwt.decode(tokenPart) as IDecoded;
        return payload?.jti;
      } catch (e) {
        return null;
      }
    };

    if (access_token) {
      const jti = decodeJti(access_token);
      if (jti) tokensToRevoke.push(jti);
    }

    if (refresh_token) {
      const jti = decodeJti(refresh_token);
      if (jti) tokensToRevoke.push(jti);
    }

    if (tokensToRevoke.length > 0) {
      await this.jwtRepository.update(
        { jti: In(tokensToRevoke) },
        { revoked: true, revokedAt: new Date() },
      );
    }
  }

  async decodeToken(token: string, type: TokenTypeEnum) {
    const parts = token.split(' ');
    const jwtToken = parts.pop();
    const signature = parts.join(' ');

    if (!jwtToken) {
      throw this.responseService.unauthorized({
        message: 'token:errors.token_validation_failed',
        info: 'auth:errors.token_validation_failed',
      });
    }

    const SECRET_KEY = this.getSecretKey(
      type,
      signature as SignatureLevelEnum,
    );
    let decoded: IDecoded;

    try {
      decoded = await this.verifyToken(jwtToken, SECRET_KEY);
    } catch (error: any) {
      if (error.name === 'TokenExpiredError') {
        throw this.responseService.unauthorized({
          message: 'token:errors.token_validation_failed',
          info: 'token:errors.token_expired',
        });
      }

      if (error.name === 'JsonWebTokenError') {
        throw this.responseService.unauthorized({
          message: 'token:errors.token_validation_failed',
          info: 'auth:errors.token_validation_failed',
        });
      }

      throw this.responseService.unauthorized({
        message: 'token:errors.token_validation_failed',
        info: error.message,
      });
    }

    let user: any = null;
    let adminSetting: any = null;

    if (decoded.userId) {
      user = await this.userRepository.findOne({
        where: {
          uuid: decoded.userId,
        },
      });
    }

    const jwt = await this.jwtRepository.findOne({
      where: {
        jti: decoded.jti,
      },
    });

    if (!user) {
      throw this.responseService.unauthorized({
        message: 'token:errors.user_account_not_found',
        info: 'token:errors.the_associated_account_could_not_be_located',
      });
    }

    if (
      adminSetting?.changeCredentialsTime &&
      adminSetting.changeCredentialsTime > new Date(decoded.iat * 1000)
    ) {
      throw this.responseService.unauthorized({
        message: 'token:errors.token_invalidated_by_recent_credential_change',
        info: 'token:errors.your_password_or_account_settings_have_been_updated_please_log_in_again',
      });
    }

    if (!jwt) {
      throw this.responseService.unauthorized({
        message: 'token:errors.invalid_or_revoked_session',
        info: 'token:errors.your_session_credentials_are_no_longer_valid_please_log_in_again',
      });
    }

    if (jwt.type !== type) {
      throw this.responseService.unauthorized({
        message: 'token:errors.invalid_token_type',
        info: 'token:errors.the_provided_token_does_not_match_the_required_token_type',
      });
    }

    if (jwt.revoked) {
      throw this.responseService.unauthorized({
        message: 'token:errors.session_expired_please_log_in_again',
        info: 'token:errors.your_session_credentials_are_no_longer_valid_please_log_in_again',
      });
    }

    if (jwt.expiresAt < new Date()) {
      if (jwt.type === TokenTypeEnum.REFRESH) {
        throw this.responseService.unauthorized({
          message: 'token:errors.refresh_token_has_expired',
          info: 'token:errors.your_session_has_timed_out_please_log_in_again',
        });
      }

      throw this.responseService.unauthorized({
        message: 'token:errors.access_token_has_expired',
        info: 'token:errors.your_access_token_has_timed_out_please_refresh_your_session',
      });
    }



    if (!(await this.hashingService.compareHash({hashText:jwt.token,plainText:token}))) {
      await this.revokeAllTokensForUser({ userId: user._id });

      /*       this.appLogger.warn({
              message: "Potential token reuse attack detected",
              context: "Security",
              meta: {
                adminId: user._id,
                jti: jwt.jti,
                tokenType: jwt.type,
              }
            })
       */
      throw this.responseService.unauthorized({
        message: 'token:errors.session_expired_please_log_in_again',
        info: 'token:errors.your_session_credentials_are_no_longer_valid_please_log_in_again',
      });
    }

    return { decoded, user };
  }
}
