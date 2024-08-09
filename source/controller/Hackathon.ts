import {
    Authorized,
    Body,
    CurrentUser,
    Delete,
    Get,
    JsonController,
    NotFoundError,
    OnNull,
    OnUndefined,
    Param,
    Patch,
    Post,
    QueryParams
} from 'routing-controllers';
import { ResponseSchema } from 'routing-controllers-openapi';
import { isEmpty } from 'web-utility';

import {
    dataSource,
    Hackathon,
    HackathonFilter,
    HackathonListChunk,
    User
} from '../model';
import { ensureAdmin, searchConditionOf } from '../utility';

@JsonController('/hackathon')
export class HackathonController {
    store = dataSource.getRepository(Hackathon);

    @Patch('/:name')
    @Authorized()
    @ResponseSchema(Hackathon)
    async updateOne(
        @CurrentUser() updatedBy: User,
        @Param('name') name: string,
        @Body() hackathon: Hackathon
    ) {
        const old = await this.store.findOne({ where: { name } });

        if (!old) throw new NotFoundError();

        ensureAdmin(updatedBy, old.createdBy);

        return this.store.save({ ...old, ...hackathon, updatedBy });
    }

    @Get('/:name')
    @ResponseSchema(Hackathon)
    @OnNull(404)
    getOne(@Param('name') name: string) {
        return this.store.findOne({ where: { name } });
    }

    @Delete('/:name')
    @Authorized()
    @OnUndefined(204)
    async deleteOne(
        @CurrentUser() deletedBy: User,
        @Param('name') name: string
    ) {
        const old = await this.store.findOne({ where: { name } });

        if (!old) throw new NotFoundError();

        ensureAdmin(deletedBy, old.createdBy);

        await this.store.delete(old.id);
    }

    @Post()
    @Authorized()
    @ResponseSchema(Hackathon)
    createOne(@CurrentUser() createdBy: User, @Body() hackathon: Hackathon) {
        return this.store.save({ ...hackathon, createdBy });
    }

    @Get()
    @ResponseSchema(HackathonListChunk)
    async getList(
        @QueryParams()
        { keywords, pageSize, pageIndex, ...filter }: HackathonFilter
    ) {
        const where = keywords
            ? searchConditionOf<Hackathon>(keywords, [
                  'name',
                  'displayName',
                  'ribbon',
                  'summary',
                  'detail',
                  'location',
                  'tags'
              ])
            : isEmpty(filter)
              ? undefined
              : filter;

        const [list, count] = await this.store.findAndCount({
            where,
            skip: pageSize * (pageIndex - 1),
            take: pageSize
        });

        return { list, count };
    }
}
