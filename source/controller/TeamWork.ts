import {
    Authorized,
    Body,
    CurrentUser,
    Delete,
    Get,
    HttpCode,
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

import {
    dataSource,
    TeamWork,
    TeamWorkFilter,
    TeamWorkListChunk,
    User
} from '../model';
import { searchConditionOf } from '../utility';
import { ActivityLogController } from './ActivityLog';
import { TeamController } from './Team';

const store = dataSource.getRepository(TeamWork);

@JsonController('/hackathon/:name/team/:tid/work')
export class TeamWorkController {
    @Post()
    @Authorized()
    @HttpCode(201)
    @ResponseSchema(TeamWork)
    async createOne(
        @CurrentUser() createdBy: User,
        @Param('tid') tid: number,
        @Body() work: TeamWork
    ) {
        const team = await store.findOne({
            where: { id: tid },
            relations: ['hackathon']
        });
        if (!team) throw new NotFoundError();

        await TeamController.ensureMember(createdBy.id, tid);

        const saved = await store.save({
            ...work,
            team,
            hackathon: team.hackathon,
            createdBy
        });
        await ActivityLogController.logCreate(createdBy, 'TeamWork', saved.id);

        return saved;
    }

    @Patch('/:id')
    @Authorized()
    @ResponseSchema(TeamWork)
    async updateOne(
        @CurrentUser() updatedBy: User,
        @Param('id') id: number,
        @Body() work: TeamWork
    ) {
        const old = await store.findOne({
            where: { id },
            relations: ['team']
        });
        if (!old) throw new NotFoundError();

        await TeamController.ensureMember(updatedBy.id, old.team.id);

        const saved = await store.save({ ...old, ...work, updatedBy });

        await ActivityLogController.logUpdate(updatedBy, 'TeamWork', id);

        return saved;
    }

    @Delete('/:id')
    @Authorized()
    @OnUndefined(204)
    async deleteOne(@CurrentUser() deletedBy: User, @Param('id') id: number) {
        const old = await store.findOne({
            where: { id },
            relations: ['team']
        });
        if (!old) throw new NotFoundError();

        await TeamController.ensureMember(deletedBy.id, old.team.id);

        await store.save({ ...old, deletedBy });
        await store.softDelete(id);

        await ActivityLogController.logDelete(deletedBy, 'TeamWork', id);
    }

    @Get('/:id')
    @OnNull(404)
    @ResponseSchema(TeamWork)
    getOne(@Param('id') id: number) {
        return store.findOneBy({ id });
    }

    @Get()
    @ResponseSchema(TeamWorkListChunk)
    async getList(
        @QueryParams()
        { type, keywords, pageSize, pageIndex }: TeamWorkFilter
    ) {
        const where = searchConditionOf<TeamWork>(
            ['title', 'description'],
            keywords,
            { type }
        );
        const [list, count] = await store.findAndCount({
            where,
            skip: pageSize * (pageIndex - 1),
            take: pageSize
        });
        return { list, count };
    }
}
