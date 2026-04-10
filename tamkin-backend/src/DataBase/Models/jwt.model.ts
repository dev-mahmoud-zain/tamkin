import { E_TokenType } from "src/Common/Enums/token.enum";
import {  I_Jwt } from "src/Common/Interfaces/jwt.interface";
import type { I_DeviceInfo } from "src/Common/Interfaces/jwt.interface";
import { Column, CreateDateColumn, Entity, PrimaryGeneratedColumn, UpdateDateColumn } from "typeorm";

@Entity()
export class JwtModel implements I_Jwt {
    @PrimaryGeneratedColumn()
    _id: string;

    @Column()
    userId: string;

    @Column()
    jti: string;

    @Column()
    token: string;

    @Column()
    type: E_TokenType;

    @Column()
    expiresAt: Date;

    @Column({default: false})
    revoked: boolean;

    @Column({nullable: true})
    revokedAt?: Date;

    @Column({type: "jsonb"})
    deviceInfo: I_DeviceInfo;

    @Column()
    ipAddress: string;

    @Column()
    userAgent: string;

    @CreateDateColumn()
    createdAt: Date;

    @UpdateDateColumn()
    updatedAt: Date;
}