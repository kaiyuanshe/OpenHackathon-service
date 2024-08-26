import { ConnectionOptions, parse } from 'pg-connection-string';
import { DataSource } from 'typeorm';
import { SqliteConnectionOptions } from 'typeorm/driver/sqlite/SqliteConnectionOptions';

import { DATABASE_URL, isProduct } from '../utility';
import { User } from './User';
import { PlatformAdmin } from './PlatformAdmin';
import { ActivityLog, UserRank } from './ActivityLog';
import { Hackathon } from './Hackathon';
import { Staff } from './Staff';
import { Organizer } from './Organizer';
import { Enrollment } from './Enrollment';
import { Team } from './Team';
import { TeamMember } from './TeamMember';

export * from './Base';
export * from './User';
export * from './OAuth';
export * from './PlatformAdmin';
export * from './ActivityLog';
export * from './Hackathon';
export * from './Staff';
export * from './Organizer';
export * from './Enrollment';
export * from './Team';
export * from './TeamMember';

const { ssl, host, port, user, password, database } = isProduct
    ? parse(DATABASE_URL)
    : ({} as ConnectionOptions);

const commonOptions: Pick<
    SqliteConnectionOptions,
    'logging' | 'synchronize' | 'entities' | 'migrations'
> = {
    logging: true,
    synchronize: true,
    entities: [
        User,
        PlatformAdmin,
        ActivityLog,
        UserRank,
        Hackathon,
        Staff,
        Organizer,
        Enrollment,
        Team,
        TeamMember
    ],
    migrations: [`${isProduct ? '.data' : 'migration'}/*.ts`]
};

export const dataSource = isProduct
    ? new DataSource({
          type: 'postgres',
          ssl: ssl as boolean,
          host,
          port: +port,
          username: user,
          password,
          database,
          ...commonOptions
      })
    : new DataSource({
          type: 'sqlite',
          database: '.data/test.db',
          ...commonOptions
      });
