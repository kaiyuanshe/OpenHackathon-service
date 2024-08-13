import { Base, Media } from './Base';
import { Team } from './Team';
import { User } from './User';

export interface Award
    extends Record<'hackathonName' | 'name' | 'description', string>,
        Base {
    quantity: number;
    target: 'team' | 'individual';
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
