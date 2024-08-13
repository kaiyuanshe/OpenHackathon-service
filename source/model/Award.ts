import { Column, Entity, ManyToOne } from 'typeorm';
import { Base, Media } from './Base';
import { Team } from './Team';
import { User } from './User';

@Entity()
export class Award extends Base {
    @Column()
    quantity: number;

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
