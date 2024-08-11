import {
    Authorized,
    Body,
    CurrentUser,
    Get,
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
        const enrollment = await this.store.findOne({
            where: { id },
            relations: ['hackathon']
        });
        if (!enrollment) throw new NotFoundError();

        ensureAdmin(updatedBy, enrollment.hackathon.createdBy);

        return this.store.save({ ...enrollment, status, updatedBy });
    }

    @Post()
    @Authorized()
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

        return this.store.save({
            createdBy,
            hackathon,
            extensions,
            status: hackathon.autoApprove
                ? EnrollmentStatus.Approved
                : EnrollmentStatus.PendingApproval
        });
    }

    @Get()
    @ResponseSchema(EnrollmentListChunk)
    async getList(
        @QueryParams()
        { status, keywords, pageSize, pageIndex }: EnrollmentFilter
    ) {
        const [list, count] = await this.store.findAndCount({
            where: keywords
                ? searchConditionOf<Enrollment>(keywords, ['extensions'])
                : status
                  ? { status }
                  : undefined,
            relations: ['createdBy'],
            skip: pageSize * (pageIndex - 1),
            take: pageSize
        });
        return { list, count };
    }
}
