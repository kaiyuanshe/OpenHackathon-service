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

import { BaseFilter, ListChunk, Media } from './Base';
import { HackathonBase } from './Hackathon';

export enum OrganizerType {
    Host = 'host',
    Organizer = 'organizer',
    Coorganizer = 'coorganizer',
    Sponsor = 'sponsor',
    TitleSponsor = 'titleSponsor'
}

@Entity()
export class Organizer extends HackathonBase {
    @IsEnum(OrganizerType)
    @Column({ type: 'enum', enum: OrganizerType })
    type: OrganizerType;

    @IsString()
    @Column()
    name: string;

    @IsString()
    @IsOptional()
    @Column({ nullable: true })
    description?: string;

    @Type(() => Media)
    @ValidateNested()
    @Column({ type: 'simple-json', nullable: true })
    logo?: Media;

    @IsUrl()
    @IsOptional()
    @Column({ nullable: true })
    url?: string;
}

export class OrganizerFilter extends BaseFilter {
    @IsEnum(OrganizerType)
    @IsOptional()
    type?: OrganizerType;
}

export class OrganizerListChunk implements ListChunk<Organizer> {
    @IsInt()
    @Min(0)
    count: number;

    @Type(() => Organizer)
    @ValidateNested({ each: true })
    list: Organizer[];
}
