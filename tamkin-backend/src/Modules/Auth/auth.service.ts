import { Injectable } from '@nestjs/common';
import { GoogleLoginDto, LoginDto, RegisterDto } from './Dto/register.dto';
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
import { E_UserProvider } from 'src/Common/Enums/user.enums';
import countries from "i18n-iso-countries";
import { compareHash, generateHash } from 'src/Common/Utils/Security/hash';

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

    async loginWithGoogle(req: Request, res: Response, body: GoogleLoginDto) {

        const { email, picture, given_name, family_name, } = await this.googleAuth.verifyGmailAccount(body.id_token, req);

        let user = await this.userModel.findOne({
            where: { email }
        })

        let status: "login" | "register" = "login";

        if (!user) {
            status = "register";

            const newUser: UserModel = await this.userModel.save({
                email,
                firstName: given_name,
                lastName: family_name,
                picture,
                provider: E_UserProvider.GOOGLE,
            })

            if (!newUser) {
                throw this.errorResponse.serverError({
                    message: req.t('auth:errors.failToCreateUser'),
                    info: req.t('auth:errors.somethingWentWrongPleaseTryAgain')
                });
            }

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

    async register(req: Request, res: Response, body: RegisterDto) {

        let user = await this.userModel.findOne({
            where: { email: body.email }
        })

        if (user) {
            throw this.errorResponse.badRequest({
                message: req.t('auth:errors.emailAlreadyExists'),
                info: req.t('auth:errors.thisAccountIsAlreadyRegisteredPleaseLogin')
            });
        }

        if (body.password !== body.confirmPassword) {
            throw this.errorResponse.badRequest({
                message: req.t('auth:errors.passwordsNotMatch'),
            });
        }

        const newUser: UserModel = await this.userModel.save({
            email: body.email,
            password: await generateHash({ text: body.password }),
            firstName: body.fullName.split(' ')[0],
            lastName: body.fullName.split(' ')[1],
            nationality: countries.getName(body.nationality, "en"),
            provider: E_UserProvider.SYSTEM,
            test:"sss"
        });

        if (!newUser) {
            throw this.errorResponse.serverError({
                message: req.t('auth:errors.failToCreateUser'),
                info: req.t('auth:errors.somethingWentWrongPleaseTryAgain')
            });
        }

        const tokens = await this.tokenService.createLoginCredentials(
            newUser.uuid,
            newUser.role
        )

        const session = this.clientInfoService.getUserSessionContext(req);

        Promise.all([
            this.tokenService.saveJwt(
                newUser.uuid,
                tokens.access_token.jti,
                tokens.access_token.token,
                E_TokenType.ACCESS,
                session
            ),

            this.tokenService.saveJwt(
                newUser.uuid,
                tokens.refresh_token.jti,
                tokens.refresh_token.token,
                E_TokenType.REFRESH,
                session
            ),

        ])

        this.cookiesService.setTokenToCookies(res, tokens.access_token.token, E_TokenType.ACCESS);
        this.cookiesService.setTokenToCookies(res, tokens.refresh_token.token, E_TokenType.REFRESH);

        return {
            user: newUser,
        }

    }

    async login(req: Request, res: Response, body: LoginDto) {

        let user = await this.userModel.findOne({
            where: { email: body.email }
        })

        if (!user || !user.password) {
            throw this.errorResponse.badRequest({
                message: req.t('auth:errors.invalidCredentials'),
                info: req.t('auth:errors.invalidCredentialsInfo')
            });
        }


        if (!await compareHash({
            plainText: body.password,
            hashText: user.password
        })) {
            throw this.errorResponse.badRequest({
                message: req.t('auth:errors.invalidCredentials'),
                info: req.t('auth:errors.invalidCredentialsInfo')
            });
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
        }

    }
    async logout(req: Request, res: Response) {
        const access_token = req.cookies['access_token'];
        const refresh_token = req.cookies['refresh_token'];

        await this.tokenService.revokeSessionTokens(access_token, refresh_token);

        this.cookiesService.removeTokenFromCookies(res, E_TokenType.ACCESS);
        this.cookiesService.removeTokenFromCookies(res, E_TokenType.REFRESH);
    }

}