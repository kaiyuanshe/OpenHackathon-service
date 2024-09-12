import { Day, formatDate } from 'web-utility';

import { Hackathon, HackathonStatus } from '../source/model';
import { Api, HttpResponse, User } from './client';
import { GITHUB_PAT } from './shared';

const client = new Api({ baseUrl: 'http://localhost:8080' });

var platformAdmin: User,
    hackathonCreator: User,
    testHackathon: Hackathon,
    teamLeader1: User;

describe('Main business logic', () => {
    it('should create the first Administator only by the first User', async () => {
        const platformAdminAccount = {
            email: 'admin@test.com',
            password: 'admin'
        };
        const { data: user1 } =
            await client.user.userControllerSignUp(platformAdminAccount);

        expect(user1.email).toBe(platformAdminAccount.email);
        expect(user1.roles).toEqual([0]);
        expect(user1.password).toBeUndefined();

        platformAdmin = { ...user1, ...platformAdminAccount };

        const hackathonCreatorAccount = {
            email: 'hackathon-creator@test.com',
            password: 'hackathon-creator'
        };
        const { data: user2 } = await client.user.userControllerSignUp(
            hackathonCreatorAccount
        );
        expect(user2.email).toBe(hackathonCreatorAccount.email);
        expect(user2.roles).toEqual([2]);
        expect(user2.password).toBeUndefined();

        hackathonCreator = { ...user2, ...hackathonCreatorAccount };
    });

    it('should sign in a User with Email & Password', async () => {
        const { data: session } = await client.user.userControllerSignIn({
            email: hackathonCreator.email,
            password: hackathonCreator.password
        });

        expect(session.email).toBe(hackathonCreator.email);
        expect(session.token).toStrictEqual(expect.any(String));

        hackathonCreator.token = session.token;
    });

    it('should get the profile of signed-in User with a valid token', async () => {
        const { data: session } = await client.user.userControllerGetSession({
            headers: { Authorization: `Bearer ${hackathonCreator.token}` }
        });
        const { password, token, deletedAt, ...user } = hackathonCreator;

        expect(session).toMatchObject(user);
    });

    it('should response 401 error with invalid token', async () => {
        try {
            await client.user.userControllerGetSession();
        } catch (error) {
            expect((error as HttpResponse<any>).status).toBe(401);
        }
    });

    it('should edit the profile of signed-in User', async () => {
        const newProfile = { name: 'Hackathon Creator' };

        const { data: user } = await client.user.userControllerUpdateOne(
            hackathonCreator.id,
            newProfile,
            { headers: { Authorization: `Bearer ${hackathonCreator.token}` } }
        );
        expect(user.name).toBe(newProfile.name);
        expect(user.token).not.toBe(hackathonCreator.token);
        expect(user.updatedAt).toStrictEqual(expect.any(String));

        hackathonCreator = { ...hackathonCreator, ...user };
    });

    it('should create a new hackathon by every user', async () => {
        const eventStartedAt = formatDate(new Date(), 'YYYY-MM-DD'),
            eventEndedAt = formatDate(+new Date() + Day, 'YYYY-MM-DD'),
            hackathonMeta = {
                name: 'test-hackathon',
                displayName: 'Test Hackathon',
                ribbon: 'Test',
                tags: ['test'],
                summary: 'Test Hackathon',
                detail: '<h1>Test Hackathon</h1>',
                location: 'https://github.com/git-hacker',
                banners: [
                    {
                        name: 'banner',
                        description: 'banner image',
                        uri: 'https://github.com/git-hacker.png'
                    }
                ]
            };
        const { data: hackathon } =
            await client.hackathon.hackathonControllerCreateOne(
                {
                    ...hackathonMeta,
                    eventStartedAt,
                    eventEndedAt,
                    enrollmentStartedAt: eventStartedAt,
                    enrollmentEndedAt: eventEndedAt,
                    judgeStartedAt: eventStartedAt,
                    judgeEndedAt: eventEndedAt
                },
                {
                    headers: {
                        Authorization: `Bearer ${hackathonCreator.token}`
                    }
                }
            );
        expect(hackathon).toMatchObject({
            ...hackathonMeta,
            autoApprove: true,
            readOnly: false,
            status: HackathonStatus.Planning,
            id: expect.any(Number),
            createdAt: expect.any(String),
            createdBy: expect.any(Object),
            updatedAt: expect.any(String)
        });

        testHackathon = hackathon;
    });

    it('should get the detail by a hackathon name', async () => {
        const { data } = await client.hackathon.hackathonControllerGetOne(
            testHackathon.name,
            { headers: { Authorization: `Bearer ${hackathonCreator.token}` } }
        );
        expect(data.id).toBe(testHackathon.id);
        expect(data.enrollment).toBe(0);
        expect(data.roles).toEqual({
            isAdmin: true,
            isJudge: false,
            isEnrolled: false
        });
        testHackathon = { ...testHackathon, ...data };
        delete testHackathon.roles;
    });

    it('should edit the detail of a hackathon by its creator', async () => {
        testHackathon.detail += '<p>Updated</p>';

        const { data } = await client.hackathon.hackathonControllerUpdateOne(
            testHackathon.name,
            testHackathon,
            { headers: { Authorization: `Bearer ${hackathonCreator.token}` } }
        );
        expect(data.detail).toBe(testHackathon.detail);
        expect(data.updatedAt).toStrictEqual(expect.any(String));
        expect(data.updatedBy.id).toBe(hackathonCreator.id);

        testHackathon = { ...testHackathon, ...data };
        delete testHackathon.updatedBy;
        delete testHackathon.deletedAt;
    });

    it('should get the list of hackathons', async () => {
        const { data: list1 } =
            await client.hackathon.hackathonControllerGetList();

        expect(list1).toEqual({ count: 1, list: [testHackathon] });

        const { data: list2 } =
            await client.hackathon.hackathonControllerGetList({
                createdBy: hackathonCreator.id
            });
        expect(list2).toEqual({ count: 1, list: [testHackathon] });
    });

    it('should search hackathons by keywords', async () => {
        const { data: list } =
            await client.hackathon.hackathonControllerGetList({
                keywords: 'test'
            });
        expect(list).toEqual({ count: 1, list: [testHackathon] });

        const { data: empty } =
            await client.hackathon.hackathonControllerGetList({
                keywords: 'not-exist'
            });
        expect(empty).toEqual({ count: 0, list: [] });
    });

    it('should sign up & in a new User with a GitHub token', async () => {
        const { status, data: session } =
            await client.user.oauthControllerSignInWithGithub({
                accessToken: GITHUB_PAT
            });
        expect(status).toBe(201);

        expect(session).toMatchObject({
            id: expect.any(Number),
            email: expect.any(String),
            name: expect.any(String),
            avatar: expect.any(String),
            password: null,
            token: expect.any(String),
            createdAt: expect.any(String),
            updatedAt: expect.any(String)
        });

        const { deletedAt, password, token, ...user } = session;

        const { data } = await client.user.userControllerGetSession({
            headers: { Authorization: `Bearer ${token}` }
        });
        expect(data).toMatchObject(user);

        teamLeader1 = session;
    });

    it('should sign in & update an existed User with a GitHub token', async () => {
        const { data: list1 } = await client.user.userControllerGetList();

        await client.user.oauthControllerSignInWithGithub({
            accessToken: GITHUB_PAT
        });
        const { data: list2 } = await client.user.userControllerGetList();

        expect(list1.count).toBe(list2.count);
    });
});
