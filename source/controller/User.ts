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
    OnNull,
    OnUndefined,
    Param,
    Post,
    Put,
    QueryParams
} from 'routing-controllers';
import { ResponseSchema } from 'routing-controllers-openapi';

import {
    dataSource,
    JWTAction,
    Role,
    SignInData,
    User,
    UserFilter,
    UserListChunk
} from '../model';
import { APP_SECRET, searchConditionOf } from '../utility';
import { ActivityLogController } from './ActivityLog';

@JsonController('/user')
export class UserController {
    store = dataSource.getRepository(User);

    static encrypt(raw: string) {
        return createHash('sha1')
            .update(APP_SECRET + raw)
            .digest('hex');
    }

    static getSession({ context: { state } }: JWTAction) {
        return state instanceof JsonWebTokenError
            ? console.error(state)
            : state.user;
    }

    @Get('/session')
    @Authorized()
    @ResponseSchema(User)
    getSession(@CurrentUser() user: User) {
        return user;
    }

    @Post('/session')
    @ResponseSchema(User)
    async signIn(@Body() { email, password }: SignInData): Promise<User> {
        const user = await this.store.findOne({
            where: {
                email,
                password: UserController.encrypt(password)
            }
        });
        if (!user) throw new ForbiddenError();

        return { ...user, token: sign({ ...user }, APP_SECRET) };
    }

    @Post()
    @HttpCode(201)
    @ResponseSchema(User)
    async signUp(@Body() data: SignInData) {
        const sum = await this.store.count();

        // eslint-disable-next-line @typescript-eslint/no-unused-vars
        const { password, ...user } = await this.store.save(
            Object.assign(new User(), data, {
                password: UserController.encrypt(data.password),
                roles: [sum ? Role.Client : Role.Administrator]
            })
        );
        await ActivityLogController.logCreate(user, 'User', user.id);

        return user;
    }

    @Put('/:id')
    @Authorized()
    @ResponseSchema(User)
    async updateOne(
        @Param('id') id: number,
        @CurrentUser() updatedBy: User,
        @Body() data: User
    ) {
        if (
            !updatedBy.roles.includes(Role.Administrator) &&
            id !== updatedBy.id
        )
            throw new ForbiddenError();

        const saved = await this.store.save({ ...data, id });

        await ActivityLogController.logUpdate(updatedBy, 'User', id);

        return saved;
    }

    @Get('/:id')
    @OnNull(404)
    @ResponseSchema(User)
    getOne(@Param('id') id: number) {
        return this.store.findOne({ where: { id } });
    }

    @Delete('/:id')
    @Authorized()
    @OnUndefined(204)
    async deleteOne(@Param('id') id: number, @CurrentUser() deletedBy: User) {
        if (
            !deletedBy.roles.includes(Role.Administrator) ||
            id !== deletedBy.id
        )
            throw new ForbiddenError();

        await this.store.softDelete(id);

        await ActivityLogController.logDelete(deletedBy, 'User', id);
    }

    @Get()
    @ResponseSchema(UserListChunk)
    async getList(
        @QueryParams() { gender, keywords, pageSize, pageIndex }: UserFilter
    ) {
        const where = searchConditionOf<User>(
            ['email', 'mobilePhone', 'name'],
            keywords,
            gender && { gender }
        );
        const [list, count] = await this.store.findAndCount({
            where,
            skip: pageSize * (pageIndex - 1),
            take: pageSize
        });
        return { list, count };
    }
}
