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
    await logout();
});

describe('users service', () => {

    it('responds with users list', async () => {
        const response = await request('/api/v1/users', {
            method: 'GET',
        });

        expect(response.json.data.length).toBeGreaterThan(1);
    });

    it('responds with user details', async () => {
        const response = await request('/api/v1/users/1', {
            method: 'GET',
        });

        expect(response.json).toMatchInlineSnapshot(`
          {
            "created_at": "2026-01-01 12:00:00",
            "email": "admin@example.com",
            "id": 1,
            "is_admin": 1,
            "name": "admin",
            "permissions": [],
            "updated_at": "2026-01-01 12:00:00",
          }
        `);
    });

    it('does not allow to add, delete or modify users without auth', async () => {
        const response = await request('/api/v1/users', {
            method: 'POST',
        });
        expect(response.status).toBe(401);

        const response1 = await request('/api/v1/users/1', {
            method: 'PATCH',
        });
        expect(response1.status).toBe(401);

        const response2 = await request('/api/v1/users/1', {
            method: 'DELETE',
        });
        expect(response2.status).toBe(401);
    });

    it('does not allow to add, delete or modify users without permissions', async () => {
        await login('reviewer');

        const response = await request('/api/v1/users/2', {
            method: 'PATCH',
        });
        expect(response.statusText).toBe('Forbidden');
        expect(response.status).toBe(403);

        const response1 = await request('/api/v1/users/2', {
            method: 'DELETE',
        });
        expect(response1.statusText).toBe('Forbidden');
        expect(response1.status).toBe(403);

        const response2 = await request('/api/v1/users', {
            method: 'POST',
        });
        expect(response2.statusText).toBe('Forbidden');
        expect(response2.status).toBe(403);

        await login('empty');
        const response3 = await request('/api/v1/users/3', {
            method: 'DELETE',
        });
        expect(response3.statusText).toBe('Forbidden');
        expect(response3.status).toBe(403);
    });

    it('allows to add, delete or modify users when admin', async () => {
        await login('admin');

        const response = await request('/api/v1/users/2', {
            method: 'PATCH',
            payload: {
                email: 'other@example.com',
                password: 'test',
                permissions: ['users.create'],
            },
        });
        expect(response.statusText).toBe('OK');
        expect(response.status).toBe(200);

        const response1 = await request('/api/v1/users/2', {
            method: 'DELETE',
        });
        expect(response1.statusText).toBe('OK');
        expect(response1.status).toBe(200);

        const response2 = await request('/api/v1/users', {
            method: 'POST',
            payload: {
                name: 'test',
                email: 'test@example.com',
                password: 'test',
            },
        });
        expect(response2.statusText).toBe('Created');
        expect(response2.status).toBe(201);
    });

    it('admin flag cannot be changed', async () => {
        await login('admin');

        const response = await request('/api/v1/users/2', {
            method: 'PATCH',
            payload: {
                is_admin: true,
            },
        });
        expect(response.status).toBe(400);
    });

    it('unable to create new admin user', async () => {
        await login('admin');

        const response = await request('/api/v1/users', {
            method: 'POST',
            payload: {
                name: 'test',
                email: 'test@example.com',
                password: 'test',
                is_admin: true,
            },
        });
        expect(response.status).toBe(400);
    });

    it('unable to create new user without permissions', async () => {
        await login('admin');

        const response = await request('/api/v1/users', {
            method: 'POST',
            payload: {
                name: 'test',
                email: 'test@example.com',
                password: 'test',
                is_admin: true,
            },
        });
        expect(response.status).toBe(400);
    });

    it('unable to change own user permissions', async () => {
        await login('admin');

        const response = await request('/api/v1/users/1', {
            method: 'PATCH',
            payload: {
                permissions: ['users.create'],
            },
        });
        expect(response.status).toBe(403);

        await login('reviewer');

        const response1 = await request('/api/v1/users/3', {
            method: 'PATCH',
            payload: {
                permissions: ['users.create'],
            },
        });
        expect(response1.status).toBe(403);
    });

    it('unable to delete admin user', async () => {
        await login('admin');

        const response = await request('/api/v1/users/1', {
            method: 'DELETE',
        });
        expect(response.status).toBe(403);
    });

    it('unable to patch admin user', async () => {
        await login('full');

        const response = await request('/api/v1/users/1', {
            method: 'PATCH',
            payload: {
                name: 'test',
                password: 'test',
            },
        });
        expect(response.status).toBe(403);
    });

    it('admin can patch admin user', async () => {
        await login('admin');

        const response = await request('/api/v1/users/1', {
            method: 'PATCH',
            payload: {
                name: 'test',
                password: 'test',
            },
        });
        expect(response.status).toBe(200);
    });

    it('unable to delete not existing user', async () => {
        await login('admin');

        const response = await request('/api/v1/users/999', {
            method: 'DELETE',
        });
        expect(response.status).toBe(404);
    });

});
