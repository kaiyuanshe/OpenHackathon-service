import { Like } from 'typeorm';
import { ForbiddenError } from 'routing-controllers';

import { Role, User } from './model';

export const { NODE_ENV, PORT = 8080, DATABASE_URL, APP_SECRET } = process.env;

export const isProduct = NODE_ENV === 'production';

export const searchConditionOf = <T>(keywords: string, keys: (keyof T)[]) =>
    keys.map(key => ({ [key]: Like(`%${keywords}%`) }));

export const ensureAdmin = ({ roles, id }: User, creator: User) => {
    if (!roles.includes(Role.Administrator) && id !== creator.id)
        throw new ForbiddenError();
};
