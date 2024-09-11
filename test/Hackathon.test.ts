import { Day, formatDate } from 'web-utility';

import {
    Hackathon,
    HackathonListChunk,
    StaffListChunk,
    StaffType,
    User
} from '../source/model';
import { client, header, initUser } from './shared';
import { HTTPError } from 'koajax';

describe('Hackathon controller', () => {
    var hackathonName: string, testHackathon: Hackathon, creator: User;

    beforeAll(
        async () =>
            (creator = await initUser({
                name: 'hacathon tester',
                email: 'hackathon@tester.com',
                password: '1234567890'
            }))
    );

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
        const { body: hackathon } = await client.post<Hackathon>(
            'hackathon',
            {
                ...hackathonMeta,
                eventStartedAt,
                eventEndedAt,
                enrollmentStartedAt: eventStartedAt,
                enrollmentEndedAt: eventEndedAt,
                judgeStartedAt: eventStartedAt,
                judgeEndedAt: eventEndedAt
            },
            header
        );

        expect(hackathon).toMatchObject({
            ...hackathonMeta,
            id: expect.any(Number),
            createdAt: expect.any(Date),
            createdBy: expect.any(Object),
            updatedAt: expect.any(Date)
        });

        hackathonName = hackathon.name;
    });

    it('should set the creator as an admin of this hackathon', async () => {
        const {
            body: { roles, createdBy, ...hackathon }
        } = await client.get<Hackathon>('hackathon/' + hackathonName, header);

        expect(roles).toMatchObject({
            isAdmin: true,
            isJudge: false,
            isEnrolled: false
        });

        const { body: staffList } = await client.get<StaffListChunk>(
            `hackathon/${hackathonName}/admin`
        );
        expect(staffList).toEqual({
            count: 1,
            list: [
                {
                    id: expect.any(Number),
                    type: StaffType.Admin,
                    user: expect.objectContaining(creator),
                    description: 'Hackathon Creator',
                    hackathon: expect.objectContaining(hackathon),
                    createdAt: expect.any(Date),
                    updatedAt: expect.any(Date)
                }
            ]
        });
        testHackathon = { ...hackathon, createdBy };
    });

    it('should update partial information by the hackathon admin', async () => {
        const newMeta = {
            tags: ['test', 'example'],
            detail: '<h1>Test Hackathon</h1><p>Example</p>'
        };
        const { body: hackathon } = await client.put<Hackathon>(
            'hackathon/' + hackathonName,
            { ...testHackathon, ...newMeta },
            header
        );
        expect(hackathon).toMatchObject({
            ...testHackathon,
            ...newMeta,
            updatedAt: expect.any(Date),
            updatedBy: expect.objectContaining(creator)
        });

        delete hackathon.updatedBy;
        testHackathon = hackathon;
    });

    it('should search hackathons by keywords', async () => {
        const { body: list } = await client.get<HackathonListChunk>(
            'hackathon?keywords=example'
        );
        expect(list).toEqual({ count: 1, list: [testHackathon] });

        const { body: empty } = await client.get<HackathonListChunk>(
            'hackathon?keywords=none'
        );
        expect(empty).toEqual({ count: 0, list: [] });
    });

    it('should delete a hackathon by its admin', async () => {
        const { status, body } = await client.delete(
            'hackathon/' + hackathonName,
            {},
            header
        );
        expect(status).toBe(204);
        expect(body).toBeUndefined();

        try {
            await client.get('hackathon/' + hackathonName);
        } catch (error) {
            expect((error as HTTPError).response.status).toBe(404);
        }
        const { body: hackathonList } =
            await client.get<HackathonListChunk>('hackathon');

        expect(hackathonList).toEqual({ count: 0, list: [] });
    });
});
