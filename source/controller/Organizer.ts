import {
    Authorized,
    Body,
    CurrentUser,
    Delete,
    Get,
    HttpCode,
    JsonController,
    NotFoundError,
    OnUndefined,
    Param,
    Patch,
    Post,
    QueryParams
} from 'routing-controllers';
import { ResponseSchema } from 'routing-controllers-openapi';

import {
    dataSource,
    Hackathon,
    Organizer,
    OrganizerFilter,
    OrganizerListChunk,
    User
} from '../model';
import { ensureAdmin, searchConditionOf } from '../utility';

@JsonController('/hackathon/:name/organizer')
export class OrganizerController {
    store = dataSource.getRepository(Organizer);
    hackathonStore = dataSource.getRepository(Hackathon);

    @Post()
    @Authorized()
    @HttpCode(201)
    @ResponseSchema(Organizer)
    async createOne(
        @CurrentUser() createdBy: User,
        @Param('name') name: string,
        @Body() organizer: Organizer
    ) {
        const hackathon = await this.hackathonStore.findOne({
            where: { name },
            relations: ['createdBy']
        });
        if (!hackathon) throw new NotFoundError();

        ensureAdmin(createdBy, hackathon.createdBy);

        return this.store.save({ ...organizer, hackathon, createdBy });
    }

    @Patch('/:id')
    @Authorized()
    @ResponseSchema(Organizer)
    async updateOne(
        @CurrentUser() updatedBy: User,
        @Param('name') name: string,
        @Param('id') id: number,
        @Body() organizer: Organizer
    ) {
        const old = await this.store.findOne({
            where: { id },
            relations: ['hackathon']
        });
        if (!old) throw new NotFoundError();

        ensureAdmin(updatedBy, old.hackathon.createdBy);

        return this.store.save({ ...old, ...organizer, updatedBy });
    }

    @Delete('/:id')
    @Authorized()
    @OnUndefined(204)
    async deleteOne(
        @CurrentUser() deletedBy: User,
        @Param('name') name: string,
        @Param('id') id: number
    ) {
        const organizer = await this.store.findOne({
            where: { id },
            relations: ['hackathon']
        });
        if (!organizer) throw new NotFoundError();

        ensureAdmin(deletedBy, organizer.hackathon.createdBy);

        await this.store.delete(id);
    }

    @Get()
    @ResponseSchema(OrganizerListChunk)
    async getList(
        @Param('name') name: string,
        @QueryParams() { type, keywords, pageSize, pageIndex }: OrganizerFilter
    ) {
        const where = searchConditionOf<Organizer>(
            ['name', 'description', 'url'],
            keywords,
            { hackathon: { name }, ...(type && { type }) }
        );
        const [list, count] = await this.store.findAndCount({
            where,
            skip: pageSize * (pageIndex - 1),
            take: pageSize
        });
        return { list, count };
    }
}
