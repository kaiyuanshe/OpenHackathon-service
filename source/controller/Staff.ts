import {
    Authorized,
    Body,
    CurrentUser,
    Delete,
    Get,
    JsonController,
    NotFoundError,
    OnUndefined,
    Param,
    Patch,
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

    @Patch('/:uid')
    @Authorized()
    @ResponseSchema(Staff)
    async updateOne(
        @CurrentUser() updatedBy: User,
        @Param('name') name: string,
        @Param('type') type: StaffType,
        @Param('uid') uid: number,
        @Body() { description }: Staff
    ) {
        const staff = await this.store.findOne({
            where: { hackathon: { name }, type, user: { id: uid } },
            relations: ['hackathon']
        });
        if (!staff) throw new NotFoundError();

        ensureAdmin(updatedBy, staff.hackathon.createdBy);

        return this.store.save({ ...staff, description, updatedBy });
    }

    @Delete('/:uid')
    @Authorized()
    @OnUndefined(204)
    async deleteOne(
        @CurrentUser() deletedBy: User,
        @Param('name') name: string,
        @Param('type') type: StaffType,
        @Param('uid') uid: number
    ) {
        const staff = await this.store.findOne({
            where: { hackathon: { name }, type, user: { id: uid } },
            relations: ['hackathon']
        });
        if (!staff) throw new NotFoundError();

        ensureAdmin(deletedBy, staff.hackathon.createdBy);

        await this.store.delete(staff);
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
