import { createServer } from '../src/app.js';
import { db } from '../src/db.js';
import type { Application } from '../src/declarations.js';

export const port = parseInt(process.env.TEST_PORT || '3031');
export const host = process.env.TEST_PORT || 'localhost';
export const baseurl = `http://${host}:${port}`;

export async function request(
    route: string,
    options: {
        method?: 'get' | 'post' | 'update' | 'patch' | 'delete';
        headers?: HeadersInit;
        payload?: any;
        rawPayload?: string;
    } = {},
) {
    const res = await fetch(`${baseurl}${route}`, {
        headers: {
            'Content-Type': 'application/json',
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

    // optional seed
    // await db.seed.run();

    return app;
}

export async function clearDb() {
    await db.migrate.rollback(undefined, true);
    await db.migrate.latest();
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
