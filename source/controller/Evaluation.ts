import {
    Authorized,
    Body,
    CurrentUser,
    ForbiddenError,
    Get,
    HttpCode,
    JsonController,
    NotFoundError,
    Param,
    Post,
    QueryParams
} from 'routing-controllers';
import { ResponseSchema } from 'routing-controllers-openapi';

import {
    BaseFilter,
    dataSource,
    Evaluation,
    EvaluationListChunk,
    Team,
    User
} from '../model';
import { searchConditionOf } from '../utility';
import { ActivityLogController } from './ActivityLog';
import { HackathonController } from './Hackathon';

const store = dataSource.getRepository(Evaluation),
    teamStore = dataSource.getRepository(Team);

@JsonController('/hackathon/:name/team/:tid/evaluation')
export class EvaluationController {
    @Post()
    @Authorized()
    @HttpCode(201)
    @ResponseSchema(Evaluation)
    async createOne(
        @CurrentUser() createdBy: User,
        @Param('name') name: string,
        @Param('tid') tid: number,
        @Body() evaluation: Evaluation
    ) {
        const team = await teamStore.findOne({
            where: { id: tid },
            relations: ['hackathon']
        });
        if (!team) throw new NotFoundError();

        const { hackathon } = team,
            now = Date.now();
        if (
            now < +new Date(hackathon.judgeStartedAt) ||
            now > +new Date(hackathon.judgeEndedAt)
        )
            throw new ForbiddenError('Not in evaluation period');

        await HackathonController.ensureJudge(createdBy.id, name);

        const saved = await store.save({
            ...evaluation,
            team,
            hackathon: team.hackathon,
            createdBy
        });
        await ActivityLogController.logCreate(
            createdBy,
            'Evaluation',
            saved.id
        );
        return saved;
    }

    @Get()
    @ResponseSchema(EvaluationListChunk)
    async getList(
        @Param('tid') tid: number,
        @QueryParams() { keywords, pageSize, pageIndex }: BaseFilter
    ) {
        const where = searchConditionOf<Evaluation>(
            ['scores', 'comment'],
            keywords,
            { team: { id: tid } }
        );
        const [list, count] = await store.findAndCount({
            where,
            skip: pageSize * (pageIndex - 1),
            take: pageSize
        });
        return { list, count };
    }
}
