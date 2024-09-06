import { Column, Entity, ManyToOne } from 'typeorm';
import {
    IsInt,
    IsOptional,
    isString,
    IsString,
    ValidateNested
} from 'class-validator';
import { Base, Media } from './Base';
import { Team } from './Team';
import { User } from './User';

@Entity()
export class Award extends Base {
    @IsString()
    @Column()
    hackathonName: string;

    @IsString()
    @Column()
    name: string;

    @IsString()
    @Column()
    description: string;

    @IsInt()
    @Column()
    quantity: number;

    @IsString()
    @Column()
    target: 'team' | 'individual';

    @Column()
    pictures: Media[];
}

export interface AwardAssignment
    extends Omit<Base, 'id'>,
        Omit<Award, 'name' | 'quantity' | 'target' | 'pictures'>,
        Record<'assignmentId' | 'assigneeId' | 'awardId', string> {
    user?: User;
    team?: Team;
    award: Award;
}
