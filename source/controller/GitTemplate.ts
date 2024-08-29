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
    Post,
    QueryParams
} from 'routing-controllers';
import { ResponseSchema } from 'routing-controllers-openapi';

import {
    BaseFilter,
    dataSource,
    GitRepository,
    GitTemplate,
    GitTemplateListChunk,
    Hackathon,
    User
} from '../model';
import { githubAPI, searchConditionOf } from '../utility';
import { ActivityLogController } from './ActivityLog';
import { HackathonController } from './Hackathon';

const store = dataSource.getRepository(GitTemplate),
    hackathonStore = dataSource.getRepository(Hackathon);

@JsonController('/hackathon/:name/git-template')
export class GitTemplateController {
    @Post()
    @Authorized()
    @HttpCode(201)
    @ResponseSchema(GitTemplate)
    async createOne(
        @CurrentUser() createdBy: User,
        @Param('name') name: string,
        @Body() { html_url }: GitTemplate
    ) {
        const hackathon = await hackathonStore.findOneBy({ name });

        if (!hackathon) throw new NotFoundError();

        await HackathonController.ensureAdmin(createdBy.id, name);

        const path = html_url.replace(
            new RegExp(String.raw`^https://github.com`),
            'repos'
        );
        const { body } = await githubAPI.get<GitRepository>(path);

        const saved = await store.save({ ...body, hackathon, createdBy });

        await ActivityLogController.logCreate(
            createdBy,
            'GitTemplate',
            saved.id
        );
        return saved;
    }

    @Delete('/:id')
    @Authorized()
    @OnUndefined(204)
    async deleteOne(
        @CurrentUser() deletedBy: User,
        @Param('name') name: string,
        @Param('id') id: number
    ) {
        const gitTemplate = await store.findOneBy({ id });

        if (!gitTemplate) throw new NotFoundError();

        await HackathonController.ensureAdmin(deletedBy.id, name);

        await store.save({ ...gitTemplate, deletedBy });
        await store.softDelete(id);

        await ActivityLogController.logDelete(deletedBy, 'GitTemplate', id);
    }

    @Get('/:id')
    @OnNull(404)
    @ResponseSchema(GitTemplate)
    getOne(@Param('id') id: number) {
        return store.findOneBy({ id });
    }

    @Get()
    @ResponseSchema(GitTemplateListChunk)
    async getList(
        @Param('name') name: string,
        @QueryParams()
        { keywords, pageSize, pageIndex }: BaseFilter
    ) {
        const where = searchConditionOf<GitTemplate>(
            [
                'name',
                'full_name',
                'html_url',
                'default_branch',
                'languages',
                'topics',
                'description',
                'homepage'
            ],
            keywords,
            { hackathon: { name } }
        );
        const [list, count] = await store.findAndCount({
            where,
            skip: pageSize * (pageIndex - 1),
            take: pageSize
        });
        return { list, count };
    }
}
