import { HTTPClient } from 'koajax';
import { FindOptionsWhere, Like } from 'typeorm';

import { Base } from './model';

export const { NODE_ENV, PORT = 8080, DATABASE_URL, JWT_SECRET } = process.env;

export const isProduct = NODE_ENV === 'production';

export const searchConditionOf = <T extends Base>(
    keys: (keyof T)[],
    keywords = '',
    filter?: FindOptionsWhere<T>
) =>
    keywords
        ? keys.map(key => ({ [key]: Like(`%${keywords}%`), ...filter }))
        : filter;

export const githubAPI = new HTTPClient({
    baseURI: 'https://api.github.com',
    responseType: 'json'
});
