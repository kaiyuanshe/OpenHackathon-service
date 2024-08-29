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
    Post
} from 'routing-controllers';
import { ResponseSchema } from 'routing-controllers-openapi';

import { dataSource, Hackathon, Questionnaire, User } from '../model';
import { ActivityLogController } from './ActivityLog';
import { HackathonController } from './Hackathon';

const store = dataSource.getRepository(Questionnaire),
    hackathonStore = dataSource.getRepository(Hackathon);

@JsonController('/hackathon/:name/questionnaire')
export class QuestionnaireController {
    @Get()
    @OnNull(404)
    @ResponseSchema(Questionnaire)
    getOne(@Param('name') name: string) {
        return store.findOneBy({ hackathon: { name } });
    }

    @Post()
    @Authorized()
    @HttpCode(201)
    @ResponseSchema(Questionnaire)
    async createOne(
        @CurrentUser() createdBy: User,
        @Param('name') name: string,
        @Body() form: Questionnaire
    ) {
        const hackathon = await hackathonStore.findOneBy({ name });

        if (!hackathon) throw new NotFoundError();

        await HackathonController.ensureAdmin(createdBy.id, name);

        const saved = await store.save({ ...form, hackathon, createdBy });

        await ActivityLogController.logCreate(
            createdBy,
            'Questionnaire',
            saved.id
        );
        return saved;
    }

    @Patch()
    @Authorized()
    @ResponseSchema(Questionnaire)
    async updateOne(
        @CurrentUser() updatedBy: User,
        @Param('name') name: string,
        @Body() { extensions }: Questionnaire
    ) {
        const old = await this.getOne(name);

        if (!old) throw new NotFoundError();

        await HackathonController.ensureAdmin(updatedBy.id, name);

        const saved = await store.save({ extensions, updatedBy });

        await ActivityLogController.logUpdate(
            updatedBy,
            'Questionnaire',
            old.id
        );
        return saved;
    }

    @Delete()
    @Authorized()
    @OnUndefined(204)
    async deleteOne(
        @CurrentUser() deletedBy: User,
        @Param('name') name: string
    ) {
        const old = await this.getOne(name);

        if (!old) throw new NotFoundError();

        await HackathonController.ensureAdmin(deletedBy.id, name);

        await store.save({ ...old, deletedBy });
        await store.softDelete(old.id);

        await ActivityLogController.logDelete(
            deletedBy,
            'Questionnaire',
            old.id
        );
    }
}
