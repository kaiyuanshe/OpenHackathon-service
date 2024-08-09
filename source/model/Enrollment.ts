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

import { Hackathon } from './Hackathon';
import { UserBase } from './User';
import { BaseFilter, InputData, ListChunk } from './Base';

export enum EnrollmentStatus {
    None = 'none',
    PendingApproval = 'pendingApproval',
    Approved = 'approved',
    Rejected = 'rejected'
}

export class Extension {
    @IsString()
    name: string;

    @IsString()
    value: string;
}

@Entity()
export class Enrollment extends UserBase {
    @Type(() => Hackathon)
    @ValidateNested()
    @IsOptional()
    @ManyToOne(() => Hackathon)
    hackathon: Hackathon;

    @IsEnum(EnrollmentStatus)
    @IsOptional()
    @Column({ type: 'simple-enum', enum: EnrollmentStatus })
    status: EnrollmentStatus;

    @Type(() => Extension)
    @ValidateNested({ each: true })
    @Column('simple-json')
    extensions: Extension[];
}

export class EnrollmentFilter
    extends BaseFilter
    implements Partial<InputData<Enrollment>>
{
    @IsEnum(EnrollmentStatus)
    @IsOptional()
    status?: EnrollmentStatus;
}

export class EnrollmentListChunk implements ListChunk<Enrollment> {
    @IsInt()
    @Min(0)
    count: number;

    @Type(() => Enrollment)
    @ValidateNested({ each: true })
    list: Enrollment[];
}
