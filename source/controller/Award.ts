import { createHash } from 'crypto';
import { JsonWebTokenError, sign } from 'jsonwebtoken';
import {
    Authorized,
    Body,
    CurrentUser,
    Delete,
    ForbiddenError,
    Get,
    JsonController,
    NotFoundError,
    OnNull,
    OnUndefined,
    Param,
    Post,
    Put,
    QueryParams
} from 'routing-controllers';
import { ResponseSchema } from 'routing-controllers-openapi';

import {
    dataSource,
    Hackathon,
    JWTAction,
    Role,
    SignInData,
    User,
    UserFilter,
    UserListChunk,
    Award
} from '../model';
import { searchConditionOf } from '../utility';

@JsonController('/hackathon/:hackathon/award/:award')
export class AwardController {
    store = dataSource.getRepository(Award);
    hackathonStore = dataSource.getRepository(Hackathon);

    @Put('/:uid')
    @Authorized()
    @ResponseSchema(Award)
    async createOne(@Param('name') name: string) {
        const hackathon = await this.hackathonStore.findOneBy({ name });
        if (!hackathon) throw new NotFoundError();

        const saved = await this.store.save({});
    }
}
