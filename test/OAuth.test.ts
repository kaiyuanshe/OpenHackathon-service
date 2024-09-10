import { ActivityLogListChunk, Operation, User } from '../source/model';
import { client, GITHUB_PAT } from './shared';

describe('OAuth controller', () => {
    var UID: number;

    it('should sign up & in a new User with a GitHub token', async () => {
        const { status, body: session } = await client.post<User>(
            'user/OAuth/GitHub',
            { accessToken: GITHUB_PAT }
        );
        expect(status).toBe(201);

        expect(session).toMatchObject({
            id: expect.any(Number),
            email: expect.any(String),
            name: expect.any(String),
            avatar: expect.any(String),
            password: null,
            token: expect.any(String),
            createdAt: expect.any(Date),
            updatedAt: expect.any(Date)
        });

        const { deletedAt, password, token, ...user } = session;

        const { body } = await client.get<User>(`user/session`, {
            Authorization: `Bearer ${token}`
        });
        expect(body).toMatchObject(user);
    });

    it('should sign in & update an existed User with a GitHub token', async () => {
        const { body } = await client.post<User>('user/OAuth/GitHub', {
            accessToken: GITHUB_PAT
        });
        const { token, ...user } = body;

        const { body: session } = await client.get<User>(`user/session`, {
            Authorization: `Bearer ${token}`
        });
        expect(session).toMatchObject(user);

        UID = user.id;
    });

    it('should record 2 activities of a new OAuth User', async () => {
        const { body } = await client.get<ActivityLogListChunk>(
            'activity-log/user/' + UID
        );
        expect(body).toEqual({
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
});
