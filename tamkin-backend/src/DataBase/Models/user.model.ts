import { E_UserProvider, E_UserRole } from 'src/Common/Enums/user.enums';
import { I_User } from 'src/Common/Interfaces/user.interface';
import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn } from 'typeorm';
import { Expose } from 'class-transformer';


@Entity()
export class UserModel implements I_User {
    @PrimaryGeneratedColumn()
    _id: number;

    @PrimaryGeneratedColumn("uuid")
    uuid: string;

    @Column({ nullable: false })
    firstName: string;

    @Column({ nullable: false })
    lastName: string;

    @Expose()
    get fullName(): string {
        return `${this.firstName} ${this.lastName}`;
    }

    @Column({ unique: true, nullable: false })
    email: string;

    @Column({ default: false })
    emailVerified: boolean;

    @Column({ enum: E_UserProvider, default: E_UserProvider.SYSTEM })
    provider: E_UserProvider;

    @Column({ nullable: true })
    password?: string;

    @Column({ nullable: true })
    picture?: string;

    @Column({ enum: E_UserRole, default: E_UserRole.USER })
    role: E_UserRole;

    @Column({ nullable: true })
    nationality?: string;

    @CreateDateColumn()
    createdAt: Date;

    @UpdateDateColumn()
    updatedAt: Date;
}