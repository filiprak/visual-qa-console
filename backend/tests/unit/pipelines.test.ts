import type { Application } from '../../src/declarations.js';
import { createSampleReport } from '../seed.js';
import { clearDb, expectSqlTimestamp, login, logout, request, setupServer, teardownServer } from '../utils.js';

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

describe('pipelines service', () => {

    it('returns list', async () => {
        await createSampleReport();

        const response = await request('/api/v1/pipelines', {
            method: 'GET',
        });

        expect(response.json).toMatchInlineSnapshot({
            data: [
                {
                    created_at: expectSqlTimestamp,
                    updated_at: expectSqlTimestamp,
                }
            ]
        }, `
          {
            "data": [
              {
                "branch_name": "master",
                "commit_sha": "f7d93421",
                "created_at": StringMatching /\\^\\\\d\\{4\\}-\\\\d\\{2\\}-\\\\d\\{2\\} \\\\d\\{2\\}:\\\\d\\{2\\}:\\\\d\\{2\\}\\$/,
                "details": {
                  "failed": 2,
                  "groups": 2,
                  "passed": 2,
                  "status": "failed",
                  "total": 4,
                },
                "id": 1,
                "name": "my-pipeline",
                "updated_at": StringMatching /\\^\\\\d\\{4\\}-\\\\d\\{2\\}-\\\\d\\{2\\} \\\\d\\{2\\}:\\\\d\\{2\\}:\\\\d\\{2\\}\\$/,
              },
            ],
            "limit": 30,
            "skip": 0,
            "total": 1,
          }
        `);
    });

    it('does not allow to remove pipeline without auth', async () => {
        await createSampleReport({ commit_sha: '985477' });

        const response1 = await request('/api/v1/pipelines/1', {
            method: 'DELETE',
        });

        expect(response1.status).toBe(401);
    });

    it('does not allow to remove pipeline without permissions', async () => {
        await login('empty');
        await createSampleReport({ commit_sha: '985477' });

        const response1 = await request('/api/v1/pipelines/1', {
            method: 'DELETE',
        });

        expect(response1.status).toBe(403);
    });

    it('removes testcases when pipeline removed', async () => {
        await login('reviewer');
        await createSampleReport({ commit_sha: '398469' });
        await createSampleReport({ commit_sha: '985477' });

        const response = await request('/api/v1/testcases');
        expect(response.json.data).toHaveLength(8);

        const response1 = await request('/api/v1/pipelines/1', {
            method: 'DELETE',
        });

        expect(response1.status).toBe(200);

        const response2 = await request('/api/v1/testcases');
        expect(response2.json.data).toHaveLength(4);
    });

});
