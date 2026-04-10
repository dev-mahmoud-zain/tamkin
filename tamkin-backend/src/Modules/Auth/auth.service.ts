import { Injectable } from '@nestjs/common';
import { LoginDto } from './Dto/register.dto';
import { ErrorResponse } from 'src/Common/Utils/Response/error.response';
import { GoogleAuth } from './Google-Auth/google.auth';
import { UserModel } from 'src/DataBase/Models/user.model';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { TokenService } from 'src/Common/Utils/Security/token.service';
import { ClientInfoService } from 'src/Common/Utils/Security/client-info.service';
import { Request, Response } from 'express';
import { E_TokenType } from 'src/Common/Enums/token.enum';
import { CookiesService } from 'src/Common/Cookies/cookies.service';

@Injectable()
export class AuthService {


    constructor(
        private readonly errorResponse: ErrorResponse,
        private readonly googleAuth: GoogleAuth,
        @InjectRepository(UserModel)
        private readonly userModel: Repository<UserModel>,
        private readonly tokenService: TokenService,
        private readonly clientInfoService: ClientInfoService,
        private readonly cookiesService: CookiesService,
    ) { }

    async loginWithGoogle(req: Request, res: Response, body: LoginDto) {

        const { email, name, picture } = await this.googleAuth.verifyGmailAccount(body.id_token);

        let user = await this.userModel.findOne({
            where: { email }
        })

        let status: "login" | "register" = "login";

        if (!user) {
            status = "register";

            const newUser = await this.userModel.save({
                email,
                name,
                picture,
            })

            user = newUser;
        }

        const tokens = await this.tokenService.createLoginCredentials(
            user.uuid,
            user.role
        )

        const session = this.clientInfoService.getUserSessionContext(req);

        Promise.all([
            this.tokenService.saveJwt(
                user.uuid,
                tokens.access_token.jti,
                tokens.access_token.token,
                E_TokenType.ACCESS,
                session
            ),

            this.tokenService.saveJwt(
                user.uuid,
                tokens.refresh_token.jti,
                tokens.refresh_token.token,
                E_TokenType.REFRESH,
                session
            ),

        ])

        this.cookiesService.setTokenToCookies(res, tokens.access_token.token, E_TokenType.ACCESS);
        this.cookiesService.setTokenToCookies(res, tokens.refresh_token.token, E_TokenType.REFRESH);

        return {
            user,
            status
        }

    }


    async loginWithFacebook(req: Request, res: Response, body: LoginDto) {
        console.log("Facebook Login")
    }

}