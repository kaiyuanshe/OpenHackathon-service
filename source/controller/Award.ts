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
    Award,
    dataSource,
    Hackathon,
    JWTAction,
    Role,
    SignInData,
    User,
    UserFilter,
    UserListChunk
} from '../model';
import { APP_SECRET, searchConditionOf } from '../utility';

@JsonController('/hackathon/:hackathon/award/:award')
export class AwardController {
    store = dataSource.getRepository(Award);
    hackathonStore = dataSource.getRepository(Hackathon);

    @Put('/:uid')
    @Authorized()
    @ResponseSchema(Award)
    async createOne(@Param('hackathon') hackathon: string) {
        const old = await this.hackathonStore.findOne({
            where: {}
        });
        if (!old) throw new NotFoundError();
    }
}
