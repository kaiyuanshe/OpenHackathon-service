import { Get, JsonController } from 'routing-controllers';
import { ResponseSchema } from 'routing-controllers-openapi';

import {
    ActivityLog,
    ActivityLogFilter,
    ActivityLogListChunk,
    dataSource,
    Operation,
    User
} from '../model';

const store = dataSource.getRepository(ActivityLog);

@JsonController('/activity-log')
export class ActivityLogController {
    static logCreate(
        createdBy: User,
        tableName: ActivityLog['tableName'],
        recordId: number
    ) {
        const operation = Operation.Create;

        return store.save({ createdBy, operation, tableName, recordId });
    }

    static logUpdate(
        createdBy: User,
        tableName: ActivityLog['tableName'],
        recordId: number
    ) {
        const operation = Operation.Update;

        return store.save({ createdBy, operation, tableName, recordId });
    }

    static logDelete(
        createdBy: User,
        tableName: ActivityLog['tableName'],
        recordId: number
    ) {
        const operation = Operation.Delete;

        return store.save({ createdBy, operation, tableName, recordId });
    }

    @Get()
    @ResponseSchema(ActivityLogListChunk)
    async getList({
        operation,
        tableName,
        recordId,
        pageSize,
        pageIndex
    }: ActivityLogFilter) {
        const [list, count] = await store.findAndCount({
            where: { operation, tableName, recordId },
            relations: ['createdBy'],
            skip: pageSize * (pageIndex - 1),
            take: pageSize
        });

        for (const activity of list)
            activity.record = await dataSource
                .getRepository<ActivityLog['record']>(activity.tableName)
                .findOneBy({ id: activity.recordId });

        return { list, count };
    }
}
