import { E_UserRole } from 'src/Common/Enums/user.enums';
import { I_User } from 'src/Common/Interfaces/user.interface';
import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn } from 'typeorm';

@Entity()
export class UserModel implements I_User {
    @PrimaryGeneratedColumn()
    _id: number;

    @PrimaryGeneratedColumn("uuid")
    uuid: string;

    @Column({nullable: false})
    name: string;

    @Column({ unique: true, nullable: false })
    email: string;

    @Column()
    picture: string;

    @Column({ enum:E_UserRole ,default: E_UserRole.USER })
    role: E_UserRole;

    @CreateDateColumn()
    createdAt: Date;

    @UpdateDateColumn()
    updatedAt: Date;
}