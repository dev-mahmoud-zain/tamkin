import { E_UserRole } from "../Enums/user.enums";


/* export interface I_UserActions {
    freezedAt?: Date;
    freezedBy?: string;
    freezedReason?: string;
    freezedUntil?: Date;
    freezedCount?: number;

    unFreezedAt?: Date;
    unFreezedBy?: string;

    bannedAt?: Date;
    bannedBy?: string;
    bannedReason?: string;
    bannedUntil?: Date;
    bannedCount?: number;

    unBannedAt?: Date;
    unBannedBy?: string;
} */



export interface I_User {
    _id: number;
    uuid: string;

    name: string;

    email: string;

    picture?: string;

    role: E_UserRole;

    createdAt: Date;
    updatedAt: Date;
}