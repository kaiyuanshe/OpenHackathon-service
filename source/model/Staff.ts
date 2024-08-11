import { Type } from 'class-transformer';
import {
    IsEnum,
    IsInt,
    IsOptional,
    IsString,
    Min,
    ValidateNested
} from 'class-validator';
import { Column, Entity, ManyToOne } from 'typeorm';

import { ListChunk } from './Base';
import { HackathonBase } from './Hackathon';
import { User } from './User';

export enum StaffType {
    Admin = 'admin',
    Judge = 'judge',
    Member = 'member'
}

@Entity()
export class Staff extends HackathonBase {
    @IsEnum(StaffType)
    @IsOptional()
    @Column({ type: 'simple-enum', enum: StaffType })
    type: StaffType;

    @Type(() => User)
    @ValidateNested()
    @IsOptional()
    @ManyToOne(() => User)
    user: User;

    @IsString()
    @IsOptional()
    @Column({ nullable: true })
    description?: string;
}

export class StaffListChunk implements ListChunk<Staff> {
    @IsInt()
    @Min(0)
    count: number;

    @Type(() => Staff)
    @ValidateNested({ each: true })
    list: Staff[];
}
