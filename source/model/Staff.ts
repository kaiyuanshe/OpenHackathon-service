import { Type } from 'class-transformer';
import { IsEnum, IsOptional, IsString, ValidateNested } from 'class-validator';
import { Column, Entity, ManyToOne } from 'typeorm';

import { Hackathon } from './Hackathon';
import { User, UserBase } from './User';

export enum StaffType {
    Admin = 'admin',
    Judge = 'judge',
    Member = 'member'
}

@Entity()
export class Staff extends UserBase {
    @IsEnum(StaffType)
    @IsOptional()
    @Column({ type: 'simple-enum', enum: StaffType })
    type: StaffType;

    @Type(() => User)
    @ValidateNested()
    @IsOptional()
    @ManyToOne(() => User)
    user: User;

    @Type(() => Hackathon)
    @ValidateNested()
    @IsOptional()
    @ManyToOne(() => Hackathon)
    hackathon: Hackathon;

    @IsString()
    @IsOptional()
    @Column({ nullable: true })
    description?: string;
}
