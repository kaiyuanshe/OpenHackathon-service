import 'dotenv/config';
import { HTTPClient } from 'koajax';

import { SignUpData, User } from '../source/model';

export const { PORT = 8080, GITHUB_PAT } = process.env;

export const client = new HTTPClient({
    baseURI: `http://127.0.0.1:${PORT}`,
    responseType: 'json'
});

export const TestAccount = {
    email: 'test@example.com',
    password: '1234567890'
};
export const header: Record<string, string> = {};

export const setToken = (token: string) =>
    (header.Authorization = `Bearer ${token}`);

export async function initUser(account: SignUpData) {
    await client.post('user', account);

    const {
        body: { token, ...user }
    } = await client.post<User>('user/session', account);

    setToken(token);

    return user;
}
