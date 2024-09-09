import { createHash } from 'crypto';
import { JsonWebTokenError, sign } from 'jsonwebtoken';
import {
    Authorized,
    Body,
    CurrentUser,
    Delete,
    ForbiddenError,
    Get,
    HttpCode,
    JsonController,
    NotFoundError,
    OnNull,
    OnUndefined,
    Param,
    Patch,
    Post,
    Put,
    QueryParams
} from 'routing-controllers';
import { ResponseSchema } from 'routing-controllers-openapi';

import {
    dataSource,
    Hackathon,
    JWTAction,
    Role,
    SignInData,
    User,
    UserFilter,
    UserListChunk,
    Award,
    Media
} from '../model';
import { searchConditionOf } from '../utility';
import { HackathonController } from './Hackathon';
import { ActivityLogController } from './ActivityLog';

@JsonController('/hackathon/:hackathon/award/:award')
export class AwardController {
    store = dataSource.getRepository(Award);
    hackathonStore = dataSource.getRepository(Hackathon);

    @Put('/:uid')
    @Authorized()
    @HttpCode(201)
    @ResponseSchema(Award)
    async createOne(
        @Param('name') name: string,
        @Param('description') description: string,
        @Param('quantity') quantity: number,
        @Param('target') target: 'team' | 'individual',
        @Param('pictures') pictures: Media[]
    ) {
        const hackathon = await this.hackathonStore.findOneBy({ name });
        if (!hackathon) throw new NotFoundError('Hackathon not found');

        const saved = await this.store.save({
            name,
            description,
            quantity,
            target,
            pictures
        });
        return saved;
    }

    @Get('/:hackathonName/:awardId')
    @OnNull(404)
    @ResponseSchema(Award)
    async getOne(
        @Param('hackathonName') hackathonName: string,
        @Param('awardId') awardId: number
    ) {
        const award = await this.store
            .createQueryBuilder('award')
            .innerJoinAndSelect('award.hackathon', 'hackathon')
            .where('hackathon.name = :hackathonName', { hackathonName })
            .andWhere('award.id = :awardId', { awardId })
            .getOne();

        if (!award) {
            return null;
        }

        return award;
    }

    @Patch('/:hackathonName/:awardId')
    @Authorized()
    @ResponseSchema(Award)
    async updateOne(
        @Param('hackathonName') hackathonName: string,
        @Param('awardId') awardId: number,
        @Body()
        updateData: Partial<
            Pick<
                Award,
                'name' | 'description' | 'quantity' | 'target' | 'pictures'
            >
        >
    ) {
        const award = await this.store
            .createQueryBuilder('award')
            .innerJoinAndSelect('award.hackathon', 'hackathon')
            .where('hackathon.name = :hackathonName', { hackathonName })
            .andWhere('award.id = :awardId', { awardId })
            .getOne();

        if (!award) throw new NotFoundError('Award not found');

        // use Object.assign update data
        Object.assign(award, updateData);

        const saved = await this.store.save(award);
        return saved;
    }

    @Delete('/:hackathonName/:announcementId')
    @Authorized()
    @OnUndefined(204)
    @ResponseSchema(Award)
    async deleteOne(
        @CurrentUser() deletedBy: User,
        @Param('hackathonName') hackathonName: string,
        @Param('awardId') awardId: number
    ) {
        const award = await this.store
            .createQueryBuilder('award')
            .innerJoinAndSelect('award.hackathon', 'hackathon')
            .where('hackathon.name = :hackathonName', { hackathonName })
            .andWhere('award.id = :awardId', { awardId })
            .getOne();

        if (!award) throw new NotFoundError('Award not found');

        await HackathonController.ensureAdmin(
            award.hackathon.createdBy.id,
            hackathonName
        );
        await this.store.softDelete(award.id);

        await ActivityLogController.logDelete(deletedBy, 'Award', award.id);
    }
}
