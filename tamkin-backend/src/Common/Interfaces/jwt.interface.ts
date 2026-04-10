import { E_TokenType } from "../Enums/token.enum";

export enum E_DeviceType {
    DESKTOP = "Desktop",
    MOBILE = "Mobile",
    TABLET = "Tablet"
}

export enum E_OS {
    LINUX = "Linux",
    WINDOWS = "Windows",
    MAC_OS = "Mac Os",
    ANDROID = "Android",
    IOS = "Ios"
}

export enum E_Browser {
    CHROME = "Chrome",
    FIREFOX = "Firefox",
    SAFARI = "Safari",
    EDGE = "Edge"
}

export interface I_DeviceInfo {
    type: E_DeviceType;
    os: E_OS;
    browser: E_Browser;
}

export interface I_Jwt {
    _id: string;

    userId?: string;

    jti: string;

    token: string;

    type: E_TokenType;

    expiresAt: Date;

    revoked: boolean;

    revokedAt?: Date;

    deviceInfo: I_DeviceInfo;

    ipAddress: string;

    userAgent: string;

    createdAt: Date;
    updatedAt: Date;
}