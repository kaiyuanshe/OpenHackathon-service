import { Column, Entity, ManyToOne } from 'typeorm';
import { Base } from './Base';
import { User } from './User';

@Entity()
export class Team extends Base {
    @Column()
    id: number;

    @Column()
    autoApprove: boolean;

    @ManyToOne(() => User)
    creator: User;

    @Column()
    membersCount: number;
}
