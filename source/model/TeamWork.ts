import { Type } from 'class-transformer';
import {
    IsEnum,
    IsInt,
    IsOptional,
    IsString,
    IsUrl,
    Min,
    ValidateNested
} from 'class-validator';
import { Column, Entity } from 'typeorm';

import { BaseFilter, InputData, ListChunk } from './Base';
import { GitTemplate } from './GitTemplate';
import { TeamBase } from './Team';

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

    @Type(() => GitTemplate)
    @ValidateNested()
    @IsOptional()
    @Column('simple-json', { nullable: true })
    gitRepository?: GitTemplate;
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
