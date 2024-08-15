import 'reflect-metadata';
import { config } from 'dotenv';

config({ path: [`.env.${process.env.NODE_ENV}.local`, '.env.local', '.env'] });

import Koa from 'koa';
import jwt from 'koa-jwt';
import KoaLogger from 'koa-logger';
import { useKoaServer } from 'routing-controllers';

import {
    BaseController,
    mocker,
    router,
    swagger,
    UserController
} from './controller';
import { dataSource } from './model';
import { JWT_SECRET, isProduct, PORT } from './utility';

const HOST = `localhost:${PORT}`,
    app = new Koa()
        .use(KoaLogger())
        .use(swagger({ exposeSpec: true }))
        .use(jwt({ secret: JWT_SECRET, passthrough: true }));

if (!isProduct) app.use(mocker());

useKoaServer(app, {
    ...router,
    cors: true,
    authorizationChecker: action => !!UserController.getSession(action),
    currentUserChecker: UserController.getSession
});

console.time('Server boot');

dataSource.initialize().then(() =>
    app.listen(PORT, () => {
        console.log(BaseController.entryOf(HOST));

        console.timeEnd('Server boot');
    })
);
