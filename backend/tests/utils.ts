import { createServer } from '../src/app.js';
import { db } from '../src/db.js';
import type { Application } from '../src/declarations.js';
import { initialSeed, TEST_USERS } from './seed.js';

export const port = parseInt(process.env.TEST_PORT || '3031');
export const host = process.env.TEST_PORT || 'localhost';
export const baseurl = `http://${host}:${port}`;

let accessToken: string | undefined;

export function setAccessToken(jwt?: string) {
    accessToken = jwt;
}

export function getAccessToken() {
    return accessToken;
}

export async function login(username: 'admin' | 'empty' | 'reviewer') {
    const user = TEST_USERS.find(i => i.name === username);
    const authResponse = await request('/api/v1/auth', {
        method: 'POST',
        payload: {
            strategy: 'local',
            email: user?.email,
            password: 'admin'
        },
    });
    setAccessToken(authResponse.json.accessToken);

    if (!accessToken) {
        throw new Error('Failed to login');
    }
}

export async function logout() {
    setAccessToken(undefined);
}

export async function request(
    route: string,
    options: {
        method?: 'GET' | 'POST' | 'UPDATE' | 'PATCH' | 'DELETE';
        headers?: HeadersInit;
        payload?: any;
        rawPayload?: string;
    } = {},
) {
    const res = await fetch(`${baseurl}${route}`, {
        headers: {
            'Content-Type': 'application/json',
            ...accessToken && { 'Authorization': `Bearer ${accessToken}` },
            ...(options.headers || {}),
        },
        method: options.method,
        body:
            options.rawPayload !== undefined
                ? options.rawPayload
                : options.payload !== undefined
                    ? JSON.stringify(options.payload)
                    : undefined,
    });
    const json = await res.json();

    return {
        json,
        status: res.status,
        statusText: res.statusText,
    };
}

export async function setupServer() {
    const app = await createServer();

    await app.listen(port);

    // reset schema
    await db.migrate.rollback(undefined, true);
    await db.migrate.latest();

    setAccessToken(undefined);

    return app;
}

export async function clearDb() {
    await db.migrate.rollback(undefined, true);
    await db.migrate.latest();

    // optional seed
    await logout();
    await initialSeed(db);
}

export async function teardownServer(app: Application) {
    await app.server.close();
    // reset schema
    // await db.migrate.rollback(undefined, true);
    // await db.migrate.latest();

    // optional seed
    // await db.seed.run();
}

export const expectSqlTimestamp = expect.stringMatching(/^\d{4}-\d{2}-\d{2} \d{2}:\d{2}:\d{2}$/);
