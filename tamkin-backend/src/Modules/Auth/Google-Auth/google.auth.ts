import { Injectable } from '@nestjs/common';
import { OAuth2Client, TokenPayload } from 'google-auth-library';
import { ErrorResponse } from 'src/Common/Utils/Response/error.response';

@Injectable()
export class GoogleAuth {
  constructor(
    private readonly ErrorResponse: ErrorResponse
  ) { }

  verifyGmailAccount = async (
    id_token: string,
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
          message: 'Fail To Verify This Account',
        });
      }

      return payload;


    } catch (error) {


      if (error.message.startsWith("Invalid argument: id_token")) {
        throw this.ErrorResponse.badRequest({
          message: 'Fail To Verify This Token',
          info: 'Invalid argument: id_token',
        });
      }

      else if (error.message.startsWith("Token used too late")) {
        throw this.ErrorResponse.badRequest({
          message: 'Fail To Verify This Token',
          info: "Token used is expired"
        });
      }

      else {
        throw this.ErrorResponse.badRequest({
          message: 'Fail To Verify This Token',
          info: error.message
        });
      }
    }
  };

}