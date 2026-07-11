import type { Application } from '../../src/declarations.js';
import { clearDb, login, logout, request, setupServer, teardownServer } from '../utils.js';
import { createSampleReport } from '../seed.js';

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

describe('baselines service', () => {

    it('does not allow to remove baseline without auth', async () => {
        await createSampleReport();
        await login('admin');
        await request('/api/v1/review', {
            method: 'POST',
            payload: {
                accepted: true,
                testcase_ids: [1, 2],
            },
        });
        await logout();

        const response1 = await request('/api/v1/baselines/1', {
            method: 'DELETE',
        });

        expect(response1.status).toBe(401);
    });

    it('does not allow to remove baseline without permissions', async () => {
        await createSampleReport();
        await login('admin');
        await request('/api/v1/review', {
            method: 'POST',
            payload: {
                accepted: true,
                testcase_ids: [1, 2],
            },
        });
        await logout();
        await login('empty');

        const response1 = await request('/api/v1/baselines/1', {
            method: 'DELETE',
        });

        expect(response1.status).toBe(403);
    });

    it('allows to remove baseline', async () => {
        await createSampleReport();
        await login('admin');
        await request('/api/v1/review', {
            method: 'POST',
            payload: {
                accepted: true,
                testcase_ids: [1, 2],
            },
        });
        await logout();
        await login('reviewer');

        const response1 = await request('/api/v1/baselines/1', {
            method: 'DELETE',
        });

        expect(response1.status).toBe(200);
    });

});
