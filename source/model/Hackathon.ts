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
import { Column, Entity, Index, ManyToOne, VirtualColumn } from 'typeorm';

import { ListChunk, Media } from './Base';
import { UserBase, UserBaseFilter, UserInputData } from './User';

export enum HackathonStatus {
    Planning = 'planning',
    PendingApproval = 'pendingApproval',
    Online = 'online',
    Offline = 'offline'
}

@Entity()
export class Hackathon extends UserBase {
    @Column()
    @Index({ unique: true })
    name: string;

    @Column({ unique: true })
    displayName: string;

    @Column()
    ribbon: string;

    @Column('simple-json')
    tags: string[];

    @Column()
    summary: string;

    @Column('text')
    detail: string;

    @Column()
    location: string;

    @Column('simple-json')
    banners: Media[];

    @Column({
        type: 'simple-enum',
        enum: HackathonStatus,
        default: HackathonStatus.Planning
    })
    status?: HackathonStatus = HackathonStatus.Planning;

    @Column('boolean', { default: false })
    readOnly?: boolean = false;

    @Column('boolean', { default: true })
    autoApprove?: boolean = true;

    @Column({ nullable: true })
    maxEnrollment?: number;

    @VirtualColumn({
        query: alias =>
            `SELECT COUNT(*) FROM "enrollment" WHERE "enrollment"."hackathonId" = ${alias}.id`
    })
    enrollment: number;

    @Column('date')
    eventStartedAt: string;

    @Column('date')
    eventEndedAt: string;

    @Column('date')
    enrollmentStartedAt: string;

    @Column('date')
    enrollmentEndedAt: string;

    @Column('date')
    judgeStartedAt: string;

    @Column('date')
    judgeEndedAt: string;

    roles?: {
        isAdmin: boolean;
        isJudge: boolean;
        isEnrolled: boolean;
    };
}

export abstract class HackathonBase extends UserBase {
    @Type(() => Hackathon)
    @ValidateNested()
    @IsOptional()
    @ManyToOne(() => Hackathon)
    hackathon: Hackathon;
}

export class HackathonInput implements UserInputData<Hackathon> {
    @IsString()
    name: string;

    @IsString()
    displayName: string;

    @IsString()
    ribbon: string;

    @IsString({ each: true })
    tags: string[];

    @IsString()
    summary: string;

    @IsString()
    detail: string;

    @IsString()
    location: string;

    @Type(() => Media)
    @ValidateNested({ each: true })
    banners: Media[];

    @IsEnum(HackathonStatus)
    @IsOptional()
    status?: HackathonStatus = HackathonStatus.Planning;

    @IsBoolean()
    @IsOptional()
    readOnly?: boolean = false;

    @IsBoolean()
    @IsOptional()
    autoApprove?: boolean = true;

    @IsInt()
    @Min(0)
    @IsOptional()
    maxEnrollment?: number;

    @IsInt()
    @Min(0)
    @IsOptional()
    enrollment: number;

    @IsDateString()
    eventStartedAt: string;

    @IsDateString()
    eventEndedAt: string;

    @IsDateString()
    enrollmentStartedAt: string;

    @IsDateString()
    enrollmentEndedAt: string;

    @IsDateString()
    judgeStartedAt: string;

    @IsDateString()
    judgeEndedAt: string;
}

export class HackathonFilter
    extends UserBaseFilter
    implements Partial<UserInputData<Hackathon>>
{
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
