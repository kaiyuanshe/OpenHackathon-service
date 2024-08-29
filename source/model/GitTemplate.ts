import { Type } from 'class-transformer';
import {
    IsInt,
    IsOptional,
    IsString,
    IsUrl,
    Min,
    ValidateNested
} from 'class-validator';
import { Repository } from 'mobx-github';
import { Column, Entity } from 'typeorm';

import { ListChunk } from './Base';
import { HackathonBase } from './Hackathon';

export type GitRepository = Pick<
    Repository,
    | 'name'
    | 'full_name'
    | 'html_url'
    | 'default_branch'
    | 'topics'
    | 'description'
    | 'homepage'
>;

@Entity()
export class GitTemplate extends HackathonBase implements GitRepository {
    @IsString()
    @IsOptional()
    @Column()
    name: string;

    @IsString()
    @IsOptional()
    @Column()
    full_name: string;

    @IsUrl()
    @Column({ unique: true })
    html_url: string;

    @IsString()
    @IsOptional()
    @Column()
    default_branch: string;

    @IsString({ each: true })
    @IsOptional()
    @Column('simple-json')
    languages: string[];

    @IsString({ each: true })
    @IsOptional()
    @Column('simple-json')
    topics?: string[];

    @IsString()
    @IsOptional()
    @Column()
    description: string;

    @IsUrl()
    @IsOptional()
    @Column()
    homepage: string;
}

export class GitTemplateListChunk implements ListChunk<GitTemplate> {
    @IsInt()
    @Min(0)
    count: number;

    @Type(() => GitTemplate)
    @ValidateNested({ each: true })
    list: GitTemplate[];
}
