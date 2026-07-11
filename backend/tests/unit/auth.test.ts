import type { Application } from '../../src/declarations.js';
import { clearDb, request, login, setupServer, teardownServer, logout, getAccessToken } from '../utils.js';

let app: Application | undefined;

beforeAll(async () => {
    app = await setupServer();
});

beforeEach(async () => {
    await clearDb();
});

afterAll(async () => {
    if (!app) return;
    await teardownServer(app);
    logout();
});

describe('auth service', () => {

    it('responds error when no credentials passed', async () => {
        const response = await request('/api/v1/auth', {
            method: 'post',
        });

        expect(response.status).toBe(401);
    });

    it('responds error when empty credentials passed', async () => {
        const response = await request('/api/v1/auth', {
            method: 'post',
            payload: {
                strategy: 'local',
                email: '',
                password: '',
            },
        });

        expect(response.status).toBe(401);
    });

    it('responds error when invalid credentials passed', async () => {
        const response = await request('/api/v1/auth', {
            method: 'post',
            payload: {
                strategy: 'local',
                email: 'admin@example.com',
                password: 'test',
            },
        });

        expect(response.status).toBe(401);
    });

    it('responds with access token when valid credentials', async () => {
        const response = await request('/api/v1/auth', {
            method: 'post',
            payload: {
                strategy: 'local',
                email: 'admin@example.com',
                password: 'admin',
            },
        });

        expect(response.json).toMatchInlineSnapshot({
            accessToken: expect.any(String),
            authentication: {
                payload: {
                    exp: expect.any(Number),
                    iat: expect.any(Number),
                    jti: expect.any(String),
                },
            },
        }, `
          {
            "accessToken": Any<String>,
            "authentication": {
              "payload": {
                "aud": "visual-qa-console",
                "exp": Any<Number>,
                "iat": Any<Number>,
                "iss": "visual-qa-console",
                "jti": Any<String>,
                "sub": "1",
              },
              "strategy": "local",
            },
            "user": {
              "created_at": "2026-01-01 12:00:00",
              "email": "admin@example.com",
              "id": 1,
              "is_admin": 1,
              "name": "admin",
              "permissions": [],
              "updated_at": "2026-01-01 12:00:00",
            },
          }
        `);
    });

    it('responds with access token when jwt strategy requested', async () => {
        await login('empty');

        const response = await request('/api/v1/auth', {
            method: 'post',
            payload: {
                strategy: 'jwt',
                accessToken: getAccessToken(),
            },
        });

        expect(response.json).toMatchInlineSnapshot({
            accessToken: expect.any(String),
            authentication: {
                accessToken: expect.any(String),
                payload: {
                    exp: expect.any(Number),
                    iat: expect.any(Number),
                    jti: expect.any(String),
                },
            },
        }, `
          {
            "accessToken": Any<String>,
            "authentication": {
              "accessToken": Any<String>,
              "payload": {
                "aud": "visual-qa-console",
                "exp": Any<Number>,
                "iat": Any<Number>,
                "iss": "visual-qa-console",
                "jti": Any<String>,
                "sub": "2",
              },
              "strategy": "jwt",
            },
            "user": {
              "created_at": "2026-01-01 12:00:00",
              "email": "empty@example.com",
              "id": 2,
              "is_admin": 0,
              "name": "empty",
              "permissions": [],
              "updated_at": "2026-01-01 12:00:00",
            },
          }
        `);
    });

});
