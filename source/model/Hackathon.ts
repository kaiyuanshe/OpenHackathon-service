import { Type } from 'class-transformer';
import {
    IsBoolean,
    IsDateString,
    IsEnum,
    IsInt,
    IsOptional,
    IsString,
    Min,
    ValidateNested
} from 'class-validator';
import { Column, Entity } from 'typeorm';

import { BaseFilter, InputData, ListChunk, Media } from './Base';
import { UserBase } from './User';

export enum HackathonStatus {
    Planning = 'planning',
    PendingApproval = 'pendingApproval',
    Online = 'online',
    Offline = 'offline'
}

@Entity()
export class Hackathon extends UserBase {
    @IsString()
    @Column({ unique: true })
    name: string;

    @IsString()
    @Column({ unique: true })
    displayName: string;

    @IsString()
    @Column()
    ribbon: string;

    @IsString({ each: true })
    @Column('simple-json')
    tags: string[];

    @IsString()
    @Column()
    summary: string;

    @IsString()
    @Column('text')
    detail: string;

    @IsString()
    @Column()
    location: string;

    @Type(() => Media)
    @ValidateNested({ each: true })
    @Column('simple-json')
    banners: Media[];

    @IsEnum(HackathonStatus)
    @IsOptional()
    @Column({
        type: 'enum',
        enum: HackathonStatus,
        default: HackathonStatus.Planning
    })
    status?: HackathonStatus = HackathonStatus.Planning;

    @IsBoolean()
    @IsOptional()
    @Column('boolean', { default: false })
    readOnly?: boolean = false;

    @IsBoolean()
    @IsOptional()
    @Column('boolean', { default: true })
    autoApprove?: boolean = true;

    @IsInt()
    @Min(0)
    @IsOptional()
    @Column({ nullable: true })
    maxEnrollment?: number;

    enrollment: number;

    @IsDateString()
    @Column('date')
    eventStartedAt: string;

    @IsDateString()
    @Column('date')
    eventEndedAt: string;

    @IsDateString()
    @Column('date')
    enrollmentStartedAt: string;

    @IsDateString()
    @Column('date')
    enrollmentEndedAt: string;

    @IsDateString()
    @Column('date')
    judgeStartedAt: string;

    @IsDateString()
    @Column('date')
    judgeEndedAt: string;

    roles: null | {
        isAdmin: boolean;
        isJudge: boolean;
        isEnrolled: boolean;
    };
}

export class HackathonFilter
    extends BaseFilter
    implements Partial<InputData<Hackathon>>
{
    @IsString()
    @IsOptional()
    name?: string;

    @IsEnum(HackathonStatus)
    @IsOptional()
    status?: HackathonStatus;

    @IsBoolean()
    @IsOptional()
    readOnly?: boolean;

    @IsBoolean()
    @IsOptional()
    autoApprove?: boolean;
}

export class HackathonListChunk implements ListChunk<Hackathon> {
    @IsInt()
    @Min(0)
    count: number;

    @Type(() => Hackathon)
    @ValidateNested({ each: true })
    list: Hackathon[];
}
