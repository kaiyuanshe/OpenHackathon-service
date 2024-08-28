import { Type } from 'class-transformer';
import { IsInt, IsString, Min, ValidateNested } from 'class-validator';
import { Column, Entity } from 'typeorm';

import { ListChunk } from './Base';
import { HackathonBase } from './Hackathon';

@Entity()
export class Announcement extends HackathonBase {
    @IsString()
    @Column()
    title: string;

    @IsString()
    @Column('text')
    content: string;
}

export class AnnouncementListChunk implements ListChunk<Announcement> {
    @IsInt()
    @Min(0)
    count: number;

    @Type(() => Announcement)
    @ValidateNested({ each: true })
    list: Announcement[];
}
