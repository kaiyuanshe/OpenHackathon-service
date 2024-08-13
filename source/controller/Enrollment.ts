import {
    Authorized,
    Body,
    CurrentUser,
    Get,
    HttpCode,
    JsonController,
    NotFoundError,
    Param,
    Patch,
    Post,
    QueryParams
} from 'routing-controllers';
import { ResponseSchema } from 'routing-controllers-openapi';

import {
    dataSource,
    Enrollment,
    EnrollmentFilter,
    EnrollmentListChunk,
    EnrollmentStatus,
    Hackathon,
    User
} from '../model';
import { ensureAdmin, searchConditionOf } from '../utility';
import { ActivityLogController } from './ActivityLog';

@JsonController('/hackathon/:name/enrollment')
export class EnrollmentController {
    store = dataSource.getRepository(Enrollment);
    hackathonStore = dataSource.getRepository(Hackathon);

    @Get('/session')
    @Authorized()
    @ResponseSchema(Enrollment)
    getSessionOne(@CurrentUser() createdBy: User) {
        return this.store.findOne({ where: { createdBy } });
    }

    @Patch('/:id')
    @Authorized()
    @ResponseSchema(Enrollment)
    async updateOne(
        @CurrentUser() updatedBy: User,
        @Param('id') id: number,
        @Body() { status }: Enrollment
    ) {
        const old = await this.store.findOne({
            where: { id },
            relations: ['hackathon']
        });
        if (!old) throw new NotFoundError();

        ensureAdmin(updatedBy, old.hackathon.createdBy);

        const saved = await this.store.save({ ...old, status, updatedBy });

        await ActivityLogController.logUpdate(updatedBy, 'Enrollment', old.id);

        return saved;
    }

    @Post()
    @Authorized()
    @HttpCode(201)
    @ResponseSchema(Enrollment)
    async createOne(
        @CurrentUser() createdBy: User,
        @Param('name') name: string,
        @Body() { extensions }: Enrollment
    ) {
        const hackathon = await this.hackathonStore.findOne({
            where: { name }
        });
        if (!hackathon) throw new NotFoundError();

        const saved = await this.store.save({
            createdBy,
            hackathon,
            extensions,
            status: hackathon.autoApprove
                ? EnrollmentStatus.Approved
                : EnrollmentStatus.PendingApproval
        });
        await ActivityLogController.logCreate(
            createdBy,
            'Enrollment',
            saved.id
        );
        return saved;
    }

    @Get()
    @ResponseSchema(EnrollmentListChunk)
    async getList(
        @QueryParams()
        { status, keywords, pageSize, pageIndex }: EnrollmentFilter
    ) {
        const where = searchConditionOf<Enrollment>(
            ['extensions'],
            keywords,
            status && { status }
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
