import 'reflect-metadata';
import { config } from 'dotenv';
import { ProxyAgent, setGlobalDispatcher } from 'undici';

config({ path: [`.env.${process.env.NODE_ENV}.local`, '.env.local', '.env'] });

import Koa from 'koa';
import jwt from 'koa-jwt';
import KoaLogger from 'koa-logger';
import { useKoaServer } from 'routing-controllers';

import {
    BaseController,
    mocker,
    controllers,
    swagger,
    UserController
} from './controller';
import { dataSource } from './model';
import { HTTP_PROXY, isProduct, JWT_SECRET, PORT } from './utility';

if (HTTP_PROXY) setGlobalDispatcher(new ProxyAgent(HTTP_PROXY));

const HOST = `localhost:${PORT}`,
    app = new Koa()
        .use(KoaLogger())
        .use(swagger({ exposeSpec: true }))
        .use(jwt({ secret: JWT_SECRET, passthrough: true }));

if (!isProduct) app.use(mocker());

useKoaServer(app, {
    controllers,
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
