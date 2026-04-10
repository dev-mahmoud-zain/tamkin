import { Injectable } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import jwt, { sign } from "jsonwebtoken";
import { Repository } from "typeorm";
import { E_TokenType } from "src/Common/Enums/token.enum";
import { I_Decoded, I_SignToken } from "src/Common/Types/token.types";
import { JwtModel } from "src/DataBase/Models/jwt.model";
import { UserModel } from "src/DataBase/Models/user.model";
import { E_UserRole } from "src/Common/Enums/user.enums";
import { I_Session } from "./client-info.service";
import { compareHash, generateHash } from "./hash";
import { ErrorResponse } from "../Response/error.response";



@Injectable()
export class TokenService {
  constructor(
    private readonly errorResponse:ErrorResponse ,
    @InjectRepository(JwtModel)
    private readonly jwtRepository: Repository<JwtModel>,
    @InjectRepository(UserModel)
    private readonly userRepository: Repository<UserModel>,

  ) { }



  private getSecretKey(
    tokenType: E_TokenType,
    role: E_UserRole | string,
  ): string {

    let key: string | undefined;

    const rolePrefix = role === E_UserRole.USER ? 'USER_' : 'ADMIN_';

    const typeSuffix = tokenType === E_TokenType.ACCESS ? 'ACCESS_TOKEN_SIGNATURE' : 'REFRESH_TOKEN_SIGNATURE';

    const keyName = `${rolePrefix}${typeSuffix}`;

    key = process.env[keyName];

    if (!key) {
      throw new Error(`Secret key ${keyName} is missing in .env`);
    }

    return key;
  }

  private async signToken(data: I_SignToken) {

    let SECRET_KEY: string = this.getSecretKey(data.tokenType, data.payload.role);

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
    role: E_UserRole | string,
  ) {

    const access_token = await this.signToken({
      payload: {
        userId,
        role,
      },
      tokenType: E_TokenType.ACCESS,
    });

    const refresh_token = await this.signToken({
      payload: {
        userId,
        role,
      },
      tokenType: E_TokenType.REFRESH,
    });

    return {
      access_token: {
        token: access_token.token,
        jti: access_token.jti,
      },

      refresh_token: {
        token: refresh_token.token,
        jti: refresh_token.jti,
      },
    };
  }

  async saveJwt(
    userId: string ,
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
    return jwt.verify(token, secretKey) as I_Decoded;
  };

  private async revokeAllTokensForUser(filter: { userId: string }) {
    await this.jwtRepository.update({
      userId: filter.userId,
    }, {
      revoked: true,
      revokedAt: new Date(),
    })
  }

   async decodeToken(
    token: string,
    type: E_TokenType,
    
  ) {

    const signature = token.split(" ")[1] ;
    let role: E_UserRole | string;
    if(signature === "System"){
      role = E_UserRole.ADMIN
    }else if(signature === "Admin"){
      role = E_UserRole.ADMIN
    }else{
      role = E_UserRole.USER
    }


    const SECRET_KEY = this.getSecretKey(type, role);
    let decoded: I_Decoded;

    try {
      decoded = await this.verifyToken(token, SECRET_KEY);
    } catch (error) {
      throw this.errorResponse.unauthorized({
        message: 'Token validation failed',
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
        message: 'User or Gate account not found',
        info: 'The associated account could not be located',
      });
    }

    if (adminSetting?.changeCredentialsTime && adminSetting.changeCredentialsTime > new Date(decoded.iat * 1000)) {
      throw this.errorResponse.unauthorized({
        message: 'Token invalidated by recent credential change',
        info: 'Your password or account settings have been updated; please log in again',
      });
    }

    if (!jwt) {
      throw this.errorResponse.unauthorized({
        message: 'Invalid or revoked session',
        info: 'Your session credentials are no longer valid. Please log in again',
      });
    }

    if (jwt.type !== type) {
      throw this.errorResponse.unauthorized({
        message: 'Invalid token type',
        info: 'The provided token does not match the required token type',
      });
    }

    if (jwt.revoked) {
      throw this.errorResponse.unauthorized({
        message: 'Session expired, please log in again',
      });
    }

    if (jwt.expiresAt < new Date()) {
      if (jwt.type === E_TokenType.REFRESH) {
        throw this.errorResponse.unauthorized({
          message: 'Refresh token has expired',
          info: 'Your session has timed out. Please log in again',
        });
      }

      throw this.errorResponse.unauthorized({
        message: 'Access token has expired',
        info: 'Your access token has timed out. Please refresh your session',
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
        message: 'Session expired, please log in again',
      });
    }

    return { decoded, user };
  }

}