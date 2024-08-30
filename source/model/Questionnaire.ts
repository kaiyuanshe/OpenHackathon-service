import { Type } from 'class-transformer';
import {
    IsBoolean,
    IsEnum,
    IsInt,
    IsOptional,
    IsString,
    Min,
    ValidateNested
} from 'class-validator';
import { Column, Entity } from 'typeorm';

import { HackathonBase } from './Hackathon';

export enum QuestionType {
    Text = 'text',
    URL = 'url'
}

export class Question {
    @IsEnum(QuestionType)
    @IsOptional()
    type?: QuestionType;

    @IsString()
    @IsOptional()
    id?: string;

    @IsString()
    title: string;

    @IsString({ each: true })
    @IsOptional()
    options?: string[];

    @IsBoolean()
    @IsOptional()
    multiple?: boolean;

    @IsBoolean()
    @IsOptional()
    required?: boolean;
}

export class Extension {
    @IsString()
    name: string;

    @IsString()
    value: string;
}

@Entity()
export class Questionnaire extends HackathonBase {
    @Type(() => Question)
    @ValidateNested({ each: true })
    @Column('simple-json')
    questions: Question[];
}

export class Dimension {
    @IsString()
    name: string;

    @IsString()
    @IsOptional()
    description?: string;

    @IsInt()
    @Min(1)
    @IsOptional()
    maximuScore?: number = 10;
}

@Entity()
export class Standard extends HackathonBase {
    @Type(() => Dimension)
    @ValidateNested({ each: true })
    @Column('simple-json')
    dimensions: Dimension[];
}
