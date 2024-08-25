import { Type } from 'class-transformer';
import {
    IsBoolean,
    IsInt,
    IsString,
    Min,
    ValidateNested
} from 'class-validator';
import { Column, Entity } from 'typeorm';

import { ListChunk } from './Base';
import { HackathonBase } from './Hackathon';

@Entity()
export class Team extends HackathonBase {
    @IsString()
    @Column()
    displayName: string;

    @IsString()
    @Column('text')
    description: string;

    @IsBoolean()
    @Column()
    autoApprove: boolean;

    membersCount: number;
}

export class TeamListChunk implements ListChunk<Team> {
    @IsInt()
    @Min(0)
    count: number;

    @Type(() => Team)
    @ValidateNested({ each: true })
    list: Team[];
}
