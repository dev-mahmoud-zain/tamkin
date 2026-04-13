import { Module } from "@nestjs/common";
import { ErrorResponse } from "../Utils/Response/error.response";
import { TypeOrmModule } from "@nestjs/typeorm";
import { UserModel } from "src/DataBase/Models/user.model";
import { JwtModel } from "src/DataBase/Models/jwt.model";
import { ClientInfoService } from "../Utils/Security/client-info.service";
import { TokenService } from "../Utils/Security/token.service";

@Module({
    imports: [
        TypeOrmModule.forFeature([UserModel, JwtModel])
    ],
    providers: [
        ErrorResponse,
        ClientInfoService,
        TokenService],
    exports: [
        TypeOrmModule.forFeature([UserModel, JwtModel]),
        ErrorResponse,
        ClientInfoService,
        TokenService
    ],
})
export class CommonModule { }