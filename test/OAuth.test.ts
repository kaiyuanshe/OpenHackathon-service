import { ListChunk, User } from '../source/model';
import { client, GITHUB_PAT } from './shared';

describe('OAuth controller', () => {
    it('should sign up a new User with a GitHub token', async () => {
        const { body: oldList } = await client.get<ListChunk<User>>('user');

        expect(oldList).toEqual({ count: 0, list: [] });

        const { body: session } = await client.post<User>('user/OAuth/GitHub', {
            accessToken: GITHUB_PAT
        });
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

        const { password, token, ...user } = session,
            { body: newList } = await client.get<ListChunk<User>>('user');

        expect(newList).toEqual({ count: 1, list: [user] });
    });

    it('should sign in an existed User with a GitHub token', async () => {
        const { body: list } = await client.get<ListChunk<User>>('user');

        expect(list).toEqual({ count: 1, list: expect.any(Array) });

        const { body: session } = await client.post<User>('user/OAuth/GitHub', {
            accessToken: GITHUB_PAT
        });
        const { password, token, ...user } = session;

        expect(user).toMatchObject(list.list[0]);
    });
});
