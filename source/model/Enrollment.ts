import { Type } from 'class-transformer';
import {
    IsEnum,
    IsInt,
    IsOptional,
    Min,
    ValidateNested
} from 'class-validator';
import { Column, Entity } from 'typeorm';

import { BaseFilter, InputData, ListChunk } from './Base';
import { HackathonBase } from './Hackathon';
import { Answer } from './Questionnaire';

export enum EnrollmentStatus {
    None = 'none',
    PendingApproval = 'pendingApproval',
    Approved = 'approved',
    Rejected = 'rejected'
}

@Entity()
export class Enrollment extends HackathonBase {
    @IsEnum(EnrollmentStatus)
    @IsOptional()
    @Column({ type: 'simple-enum', enum: EnrollmentStatus })
    status: EnrollmentStatus;

    @Type(() => Answer)
    @ValidateNested({ each: true })
    @Column('simple-json')
    form: Answer[];
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
