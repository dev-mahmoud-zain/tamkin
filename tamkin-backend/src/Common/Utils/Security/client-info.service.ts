import { Injectable } from "@nestjs/common";
import { Request } from "express";
import { E_Browser, E_DeviceType, I_DeviceInfo, E_OS } from "src/Common/Interfaces/jwt.interface";

import { UAParser } from "ua-parser-js";


export interface I_Session {
    deviceInfo: I_DeviceInfo,
    ipAddress: string,
    userAgent: string,
}

@Injectable()
export class ClientInfoService {

    private parseDeviceInfo(userAgent: string) {
        const parser = new UAParser(userAgent);
        const result = parser.getResult();

        // Device Type
        let type = E_DeviceType.DESKTOP;
        if (result.device.type === "mobile") type = E_DeviceType.MOBILE;
        if (result.device.type === "tablet") type = E_DeviceType.TABLET;

        // OS
        let os: E_OS;
        switch (result.os.name) {
            case "Windows":
                os = E_OS.WINDOWS;
                break;
            case "Mac OS":
                os = E_OS.MAC_OS;
                break;
            case "Android":
                os = E_OS.ANDROID;
                break;
            case "iOS":
                os = E_OS.IOS;
                break;
            default:
                os = E_OS.LINUX;
        }

        // Browser
        let browser: E_Browser;
        switch (result.browser.name) {
            case "Firefox":
                browser = E_Browser.FIREFOX;
                break;
            case "Safari":
                browser = E_Browser.SAFARI;
                break;
            case "Edge":
                browser = E_Browser.EDGE;
                break;
            default:
                browser = E_Browser.CHROME; // Chromium-based
        }

        return {
            type,
            os,
            browser
        };
    }

    getUserSessionContext(req: Request): I_Session {

        const userAgent = req.headers["user-agent"] || "unknown";

        const ipAddress =
            (req.headers["x-forwarded-for"] as string)?.split(",")[0]?.trim() ||
            req.socket.remoteAddress ||
            "unknown";

        const deviceInfo = this.parseDeviceInfo(userAgent);

        return {
            deviceInfo,
            ipAddress,
            userAgent
        };


    }

}