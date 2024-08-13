import { Type } from 'class-transformer';
import {
    IsEnum,
    IsInt,
    IsObject,
    IsOptional,
    Min,
    ValidateNested
} from 'class-validator';
import { Column, Entity } from 'typeorm';

import { Base, BaseFilter, InputData, ListChunk } from './Base';
import { User, UserBase } from './User';
import { PlatformAdmin } from './PlatformAdmin';
import { Hackathon } from './Hackathon';
import { Staff } from './Staff';
import { Organizer } from './Organizer';
import { Enrollment } from './Enrollment';

export enum Operation {
    Create = 'create',
    Update = 'update',
    Delete = 'delete'
}

const LogableTable = {
    User,
    PlatformAdmin,
    Hackathon,
    Staff,
    Organizer,
    Enrollment
};
const LogableTableEnum = Object.fromEntries(
    Object.entries(LogableTable).map(([key]) => [key, key])
);

@Entity()
export class ActivityLog extends UserBase {
    @IsEnum(Operation)
    @Column({ type: 'simple-enum', enum: Operation })
    operation: Operation;

    @IsEnum(LogableTableEnum)
    @Column({ type: 'simple-enum', enum: LogableTableEnum })
    tableName: keyof typeof LogableTable;

    @IsInt()
    @Min(1)
    @Column()
    recordId: number;

    @IsObject()
    @IsOptional()
    record?: Base;
}

export class ActivityLogFilter
    extends BaseFilter
    implements Partial<InputData<ActivityLog>>
{
    @IsEnum(Operation)
    @IsOptional()
    operation?: Operation;

    @IsEnum(LogableTableEnum)
    @IsOptional()
    tableName?: keyof typeof LogableTable;

    @IsInt()
    @Min(1)
    @IsOptional()
    recordId?: number;
}

export class ActivityLogListChunk implements ListChunk<ActivityLog> {
    @IsInt()
    @Min(0)
    count: number;

    @Type(() => ActivityLog)
    @ValidateNested({ each: true })
    list: ActivityLog[];
}
