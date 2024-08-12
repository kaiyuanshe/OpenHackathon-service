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
    Enrollment,
    Hackathon,
    HackathonFilter,
    HackathonListChunk,
    User
} from '../model';
import { ensureAdmin, searchConditionOf } from '../utility';
import { ActivityLogController } from './ActivityLog';

@JsonController('/hackathon')
export class HackathonController {
    store = dataSource.getRepository(Hackathon);
    enrollment = dataSource.getRepository(Enrollment);

    @Patch('/:name')
    @Authorized()
    @ResponseSchema(Hackathon)
    async updateOne(
        @CurrentUser() updatedBy: User,
        @Param('name') name: string,
        @Body() newData: Hackathon
    ) {
        const old = await this.store.findOne({
            where: { name },
            relations: ['createdBy']
        });
        if (!old) throw new NotFoundError();

        ensureAdmin(updatedBy, old.createdBy);

        const saved = await this.store.save({ ...old, ...newData, updatedBy });

        await ActivityLogController.logUpdate(updatedBy, 'Hackathon', old.id);

        return saved;
    }

    @Get('/:name')
    @ResponseSchema(Hackathon)
    @OnNull(404)
    async getOne(@CurrentUser() user: User, @Param('name') name: string) {
        const hackathon = await this.store.findOne({
            where: { name },
            relations: ['createdBy']
        });

        if (user) {
            const enrollment = await this.enrollment.findOne({
                where: { createdBy: { id: user.id } }
            });
            hackathon.roles = {
                isAdmin: user.id === hackathon.createdBy.id,
                isJudge: false,
                isEnrolled: !!enrollment
            };
        }
        return hackathon;
    }

    @Delete('/:name')
    @Authorized()
    @OnUndefined(204)
    async deleteOne(
        @CurrentUser() deletedBy: User,
        @Param('name') name: string
    ) {
        const old = await this.store.findOne({
            where: { name },
            relations: ['createdBy']
        });
        if (!old) throw new NotFoundError();

        ensureAdmin(deletedBy, old.createdBy);

        await this.store.save({ ...old, deletedBy });
        await this.store.softDelete(old.id);

        await ActivityLogController.logDelete(deletedBy, 'Hackathon', old.id);
    }

    @Post()
    @Authorized()
    @HttpCode(201)
    @ResponseSchema(Hackathon)
    async createOne(
        @CurrentUser() createdBy: User,
        @Body() hackathon: Hackathon
    ) {
        const saved = await this.store.save({ ...hackathon, createdBy });

        await ActivityLogController.logCreate(createdBy, 'Hackathon', saved.id);

        return saved;
    }

    @Get()
    @ResponseSchema(HackathonListChunk)
    async getList(
        @QueryParams()
        { keywords, pageSize, pageIndex, ...filter }: HackathonFilter
    ) {
        const where = searchConditionOf<Hackathon>(
            [
                'name',
                'displayName',
                'ribbon',
                'summary',
                'detail',
                'location',
                'tags'
            ],
            keywords,
            filter
        );
        const [list, count] = await this.store.findAndCount({
            where,
            relations: ['createdBy'],
            skip: pageSize * (pageIndex - 1),
            take: pageSize
        });
        return { list, count };
    }
}
