import { Entity, Column } from 'typeorm';
import {
    IsEnum,
    IsInt,
    IsOptional,
    IsString,
    IsUrl,
    Min,
    ValidateNested
} from 'class-validator';

import { TeamBase } from './Team';
import { BaseFilter, InputData, ListChunk } from './Base';
import { Type } from 'class-transformer';

export enum TeamWorkType {
    Image = 'image',
    Website = 'website',
    Video = 'video',
    Word = 'word',
    PowerPoint = 'powerpoint'
}

@Entity()
export class TeamWork extends TeamBase {
    @IsEnum(TeamWorkType)
    @Column({ type: 'simple-enum', enum: TeamWorkType })
    type: TeamWorkType;

    @IsString()
    @Column()
    title: string;

    @IsUrl()
    @Column()
    url: string;

    @IsString()
    @Column('text')
    description: string;
}

export class TeamWorkFilter
    extends BaseFilter
    implements Partial<InputData<TeamWork>>
{
    @IsEnum(TeamWorkType)
    @IsOptional()
    type?: TeamWorkType;
}

export class TeamWorkListChunk implements ListChunk<TeamWork> {
    @IsInt()
    @Min(0)
    count: number;

    @Type(() => TeamWork)
    @ValidateNested({ each: true })
    list: TeamWork[];
}
