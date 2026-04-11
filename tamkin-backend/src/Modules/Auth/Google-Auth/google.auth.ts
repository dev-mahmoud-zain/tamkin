import { Injectable } from '@nestjs/common';
import { OAuth2Client, TokenPayload } from 'google-auth-library';
import { ErrorResponse } from 'src/Common/Utils/Response/error.response';
import { Request } from 'express';

@Injectable()
export class GoogleAuth {
  constructor(
    private readonly ErrorResponse: ErrorResponse
  ) { }

  verifyGmailAccount = async (
    id_token: string,
    req: Request,
  ): Promise<TokenPayload> => {
    try {

      const client = new OAuth2Client();

      let ticket = await client.verifyIdToken({
        idToken: id_token,
        audience: process.env.WEB_CLIENT_ID as string,
      });

      const payload = ticket.getPayload();

      if (!payload?.email_verified) {
        throw this.ErrorResponse.badRequest({
          message: req.t('auth:errors.failToVerifyThisToken'),
          info: req.t('auth:errors.failToVerifyThisAccount'),
        });
      }

      return payload;


    } catch (error) {

      if (error.message.startsWith("Invalid argument: id_token")) {
        throw this.ErrorResponse.badRequest({
          message: req.t('auth:errors.failToVerifyThisToken'),
          info: 'Invalid argument: id_token',
        });
      }

      else if (error.message.startsWith("Token used too late")) {
        throw this.ErrorResponse.badRequest({
          message: req.t('auth:errors.failToVerifyThisToken'),
          info: req.t('auth:errors.tokenUsedTooLate'),
        });
      }

      else {
        throw this.ErrorResponse.badRequest({
          message: req.t('auth:errors.failToVerifyThisToken'),
        });
      }
    }
  };

}