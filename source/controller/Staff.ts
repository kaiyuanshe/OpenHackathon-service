import {
    Authorized,
    Body,
    CurrentUser,
    Get,
    JsonController,
    NotFoundError,
    Param,
    Put,
    QueryParams
} from 'routing-controllers';
import { ResponseSchema } from 'routing-controllers-openapi';

import {
    BaseFilter,
    dataSource,
    Hackathon,
    Staff,
    StaffType,
    User
} from '../model';
import { ensureAdmin, searchConditionOf } from '../utility';

@JsonController('/hackathon/:name/:type')
export class StaffController {
    store = dataSource.getRepository(Staff);
    userStore = dataSource.getRepository(User);
    hackathonStore = dataSource.getRepository(Hackathon);

    @Put('/:uid')
    @Authorized()
    @ResponseSchema(Staff)
    async createOne(
        @CurrentUser() createdBy: User,
        @Param('name') name: string,
        @Param('type') type: StaffType,
        @Param('uid') uid: number,
        @Body() staff: Staff
    ) {
        const [user, hackathon] = await Promise.all([
            this.userStore.findOneBy({ id: uid }),
            this.hackathonStore.findOne({
                where: { name },
                relations: ['createdBy']
            })
        ]);
        if (!user || !hackathon || !StaffType[type]) throw new NotFoundError();

        ensureAdmin(createdBy, hackathon.createdBy);

        return this.store.save({ ...staff, type, user, hackathon, createdBy });
    }

    @Get()
    async getList(
        @Param('name') name: string,
        @Param('type') type: StaffType,
        @QueryParams() { keywords, pageSize, pageIndex }: BaseFilter
    ) {
        const where = {
            hackathon: { name },
            type,
            ...(keywords
                ? searchConditionOf<Staff>(keywords, ['description'])[0]
                : {})
        };
        const [list, count] = await this.store.findAndCount({
            where,
            relations: ['user'],
            skip: pageSize * (pageIndex - 1),
            take: pageSize
        });
        return { list, count };
    }
}
