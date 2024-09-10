import {
    ActivityLogListChunk,
    Operation,
    Role,
    User,
    UserListChunk
} from '../source/model';
import { client, header, setToken, TestAccount } from './shared';

describe('User controller', () => {
    var UID: number;

    it('should response 401 error with invalid token', async () => {
        try {
            await client.get('user/session');
        } catch (error) {
            expect(error.response.status).toBe(401);
        }
    });

    it('should sign up a new User with Email & Password', async () => {
        const { status, body: user } = await client.post<User>(
                'user',
                TestAccount
            ),
            { body: list } = await client.get<UserListChunk>('user');

        expect(status).toBe(201);

        expect(user).toMatchObject({
            id: expect.any(Number),
            email: TestAccount.email,
            name: TestAccount.email,
            roles: list.count < 2 ? [Role.Administrator] : [Role.Client]
        });

        UID = user.id;
    });

    it('should sign in an existed User with Email & Password', async () => {
        const { status, body: session } = await client.post<User>(
            'user/session',
            TestAccount
        );
        expect(status).toBe(201);

        expect(session).toMatchObject({
            id: expect.any(Number),
            email: TestAccount.email,
            name: TestAccount.email,
            roles: expect.any(Array),
            createdAt: expect.any(Date),
            updatedAt: expect.any(Date),
            token: expect.any(String)
        });

        setToken(session.token);
    });

    it('should get the profile of signed-in User with a valid token', async () => {
        const { body: session } = await client.get<User>(
            'user/session',
            header
        );
        const { body: user } = await client.get<User>(`user/${session.id}`);

        expect(session).toMatchObject(user);
    });

    it('should be able to edit the profile of signed-in User', async () => {
        const { body: session } = await client.get<User>(
            'user/session',
            header
        );
        const { body: user } = await client.patch<User>(
            `user/${session.id}`,
            { name: 'Test User' },
            header
        );
        expect(user).toMatchObject({
            name: 'Test User',
            updatedAt: expect.any(Date)
        });
    });

    it('should record 2 activities of a signed-up & edited User', async () => {
        const { body } = await client.get<ActivityLogListChunk>(
            'activity-log/user/' + UID
        );
        expect(body).toMatchObject({
            count: 2,
            list: [
                {
                    id: expect.any(Number),
                    operation: Operation.Create,
                    tableName: 'User',
                    recordId: UID,
                    record: expect.any(Object),
                    createdAt: expect.any(Date),
                    createdBy: expect.any(Object),
                    updatedAt: expect.any(Date)
                },
                {
                    id: expect.any(Number),
                    operation: Operation.Update,
                    tableName: 'User',
                    recordId: UID,
                    record: expect.any(Object),
                    createdAt: expect.any(Date),
                    createdBy: expect.any(Object),
                    updatedAt: expect.any(Date)
                }
            ]
        });
    });

    it('should not be able to self-delete for an Administator', async () => {
        const { body: session } = await client.get<User>(
            'user/session',
            header
        );
        try {
            await client.delete(`user/${session.id}`, {}, header);
        } catch (error) {
            expect(error.response.status).toBe(403);
        }
    });

    it('should be able to search users by part of email or name', async () => {
        const { body: session } = await client.get<User>(
            'user/session',
            header
        );
        const { body: result_1 } =
            await client.get<UserListChunk>('user?keywords=Test');

        expect(result_1.count).toBe(1);
        expect(result_1.list[0].id).toBe(session.id);

        const { body: result_2 } = await client.get<UserListChunk>(
            'user?keywords=example.com'
        );
        expect(result_2.count).toBe(1);
        expect(result_2.list[0].id).toBe(session.id);

        const { body: empty } = await client.get<UserListChunk>(
            'user?keywords=Admin'
        );
        expect(empty).toEqual({ count: 0, list: [] });
    });
});
