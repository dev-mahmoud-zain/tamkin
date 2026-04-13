import { Inject, Injectable, Scope } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import jwt, { sign } from "jsonwebtoken";
import { In, Repository } from "typeorm";
import { E_TokenType } from "src/Common/Enums/token.enum";
import { I_Decoded, I_SignToken } from "src/Common/Types/token.types";
import { JwtModel } from "src/DataBase/Models/jwt.model";
import { UserModel } from "src/DataBase/Models/user.model";
import { E_UserRole } from "src/Common/Enums/user.enums";
import { I_Session } from "./client-info.service";
import { compareHash, generateHash } from "./hash";
import { ErrorResponse } from "../Response/error.response";
import { E_SignatureLevel } from "src/Common/Enums/signature.level.enum";
import type { Request } from "express";



@Injectable({ scope: Scope.REQUEST })
export class TokenService {
  constructor(
    private readonly errorResponse: ErrorResponse,
    @InjectRepository(JwtModel)
    private readonly jwtRepository: Repository<JwtModel>,
    @InjectRepository(UserModel)
    private readonly userRepository: Repository<UserModel>,
    @Inject("REQUEST")
    private readonly request: Request,
  ) { }

  private getSecretKey(
    tokenType: E_TokenType,
    signature: E_SignatureLevel,
  ): string {


    let key: string | undefined;

    switch (tokenType) {
      case E_TokenType.ACCESS:
        switch (signature) {
          case E_SignatureLevel.SUPER_ADMIN:
            key = process.env.SUPER_ADMIN_ACCESS_TOKEN_SECRET;
            break;
          case E_SignatureLevel.ADMIN:
            key = process.env.ADMIN_ACCESS_TOKEN_SECRET;
            break;
          case E_SignatureLevel.USER:
            key = process.env.USER_ACCESS_TOKEN_SECRET;
            break;
        }
        break;
      case E_TokenType.REFRESH:
        switch (signature) {
          case E_SignatureLevel.SUPER_ADMIN:
            key = process.env.SUPER_ADMIN_REFRESH_TOKEN_SECRET;
            break;
          case E_SignatureLevel.ADMIN:
            key = process.env.ADMIN_REFRESH_TOKEN_SECRET;
            break;
          case E_SignatureLevel.USER:
            key = process.env.USER_REFRESH_TOKEN_SECRET;
            break;
        }
        break;
    }

    if (!key) {
      throw this.errorResponse.serverError({
        message: this.request.t('token:errors.secret_key_missing'),
      })
    }

    return key;
  }

  private async signToken(data: I_SignToken) {


    let SECRET_KEY: string = this.getSecretKey(data.tokenType, data.payload.signature);

    const ACCESS_TOKEN_EXPIRES = process.env.NODE_ENV === "Development" ? process.env.ACCESS_TOKEN_EXPIRES_DEV_MOOD ?? "24h" : process.env.ACCESS_TOKEN_EXPIRES ?? "1h";

    const REFRESH_TOKEN_EXPIRES = process.env.REFRESH_TOKEN_EXPIRES ?? "7h";

    const expiresIn = data.tokenType === E_TokenType.ACCESS ? ACCESS_TOKEN_EXPIRES : REFRESH_TOKEN_EXPIRES;

    const jti = crypto.randomUUID();

    return {
      token: sign(
        data.payload,
        SECRET_KEY,
        {
          expiresIn: expiresIn as any,
          jwtid: jti,
        }),
      jti,
    };
  }

  async createLoginCredentials(
    userId: string,
    role: E_UserRole,
  ) {

    let signature: E_SignatureLevel = E_SignatureLevel.USER;


    switch (role) {
      case E_UserRole.SUPER_ADMIN:
        signature = E_SignatureLevel.SUPER_ADMIN;
        break;

      case E_UserRole.ADMIN:
        signature = E_SignatureLevel.ADMIN;
        break;

      default:
        signature = E_SignatureLevel.USER;
        break;
    }


    const access_token = await this.signToken({
      payload: {
        userId,
        role,
        signature
      },
      tokenType: E_TokenType.ACCESS,
    });

    const refresh_token = await this.signToken({
      payload: {
        userId,
        role,
        signature
      },
      tokenType: E_TokenType.REFRESH,
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
    type: E_TokenType,
    session: I_Session,
  ) {


    const expiresAt =
      type === E_TokenType.ACCESS
        ? new Date(Date.now() + (process.env.NODE_ENV === "Development" ? 24 * 60 * 60 * 1000 : 60 * 60 * 1000))
        : new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);

    await this.jwtRepository.save({
      userId,
      token: await generateHash({ text: token }),
      type,
      jti,
      ipAddress: session.ipAddress,
      deviceInfo: session.deviceInfo,
      userAgent: session.userAgent,
      expiresAt,
    })
  }

  private verifyToken = async (
    token: string,
    secretKey: string,
  ): Promise<I_Decoded> => {

    try {
      return jwt.verify(token, secretKey) as I_Decoded;
    } catch (error: any) {
      throw this.errorResponse.unauthorized({
        message: this.request.t('auth:errors.token_validation_failed'),
        info: error.message,
      });
    }
  };

  private async revokeAllTokensForUser(filter: { userId: string }) {
    await this.jwtRepository.update({
      userId: filter.userId,
    }, {
      revoked: true,
      revokedAt: new Date(),
    })
  }

  async revokeSessionTokens(access_token?: string, refresh_token?: string) {
    const tokensToRevoke: string[] = [];

    const decodeJti = (token: string) => {
      try {
        const tokenPart = token.includes(" ") ? token.split(" ")[1] : token;
        const payload = jwt.decode(tokenPart) as I_Decoded;
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
        { revoked: true, revokedAt: new Date() }
      );
    }
  }

  async decodeToken(
    token: string,
    type: E_TokenType,

  ) {


    const SECRET_KEY = this.getSecretKey(type, token.split(" ")[0] as E_SignatureLevel);
    let decoded: I_Decoded;

    try {
      decoded = await this.verifyToken(token.split(" ")[1], SECRET_KEY);
    } catch (error: any) {

      const message = this.request.t('token:errors.token_validation_failed');

      if (error.name === 'TokenExpiredError') {
        throw this.errorResponse.unauthorized({
          message: message,
          info: this.request.t('token:errors.token_expired'),
        });
      }

      if (error.name === 'JsonWebTokenError') {
        throw this.errorResponse.unauthorized({
          message: message,
          info: this.request.t('auth:errors.token_validation_failed'),
        });
      }

      throw this.errorResponse.unauthorized({
        message: message,
        info: error.message,
      });


    }

    let user: any = null;
    let adminSetting: any = null;

    if (decoded.userId) {
      user = await this.userRepository.findOne({
        where: {
          uuid: decoded.userId,
        }
      })
    }

    const jwt = await this.jwtRepository.findOne({
      where: {
        jti: decoded.jti,
      },
    });

    if (!user) {
      throw this.errorResponse.unauthorized({
        message: this.request.t('token:errors.user_account_not_found'),
        info: this.request.t('token:errors.the_associated_account_could_not_be_located'),
      });
    }

    if (adminSetting?.changeCredentialsTime && adminSetting.changeCredentialsTime > new Date(decoded.iat * 1000)) {
      throw this.errorResponse.unauthorized({
        message: this.request.t('token:errors.token_invalidated_by_recent_credential_change'),
        info: this.request.t('token:errors.your_password_or_account_settings_have_been_updated_please_log_in_again'),
      });
    }

    if (!jwt) {
      throw this.errorResponse.unauthorized({
        message: this.request.t('token:errors.invalid_or_revoked_session'),
        info: this.request.t('token:errors.your_session_credentials_are_no_longer_valid_please_log_in_again'),
      });
    }

    if (jwt.type !== type) {
      throw this.errorResponse.unauthorized({
        message: this.request.t('token:errors.invalid_token_type'),
        info: this.request.t('token:errors.the_provided_token_does_not_match_the_required_token_type'),
      });
    }

    if (jwt.revoked) {
      throw this.errorResponse.unauthorized({
        message: this.request.t('token:errors.session_expired_please_log_in_again'),
        info: this.request.t('token:errors.your_session_credentials_are_no_longer_valid_please_log_in_again'),
      });
    }

    if (jwt.expiresAt < new Date()) {

      if (jwt.type === E_TokenType.REFRESH) {
        throw this.errorResponse.unauthorized({
          message: this.request.t('token:errors.refresh_token_has_expired'),
          info: this.request.t('token:errors.your_session_has_timed_out_please_log_in_again'),
        });
      }

      throw this.errorResponse.unauthorized({
        message: this.request.t('token:errors.access_token_has_expired'),
        info: this.request.t('token:errors.your_access_token_has_timed_out_please_refresh_your_session'),
      });
    }

    if (!(await compareHash({ plainText: token, hashText: jwt.token }))) {
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
      throw this.errorResponse.unauthorized({
        message: this.request.t('token:errors.session_expired_please_log_in_again'),
        info: this.request.t('token:errors.your_session_credentials_are_no_longer_valid_please_log_in_again'),
      });
    }

    return { decoded, user };
  }

}