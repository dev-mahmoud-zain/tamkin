import { IsEmail, IsNotEmpty, IsString, IsStrongPassword, Matches, Validate } from "class-validator";
import { USER_REGEX } from "../Common-Regex/common-regex";
import { IsCountryCode } from "./country.validate";

export class UserValidators {
    @Matches(USER_REGEX.fullName)
    @IsString()
    @IsNotEmpty()
    fullName:string;
    
    @IsStrongPassword()
    @IsString()
    @IsNotEmpty()
    password:string;

    @IsEmail()
    @IsString()
    @IsNotEmpty()
    email:string;

    @IsString()
    @IsNotEmpty()
    confirmPassword:string;

    @Validate(IsCountryCode)
    @IsString()
    @IsNotEmpty()
    nationality:string;
}