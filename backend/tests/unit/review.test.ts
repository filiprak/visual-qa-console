import type { Application } from '../../src/declarations.js';
import { expectSqlTimestamp, request, setupServer, teardownServer } from '../utils.js';

let app: Application | undefined;

beforeAll(async () => {
    app = await setupServer();
});

afterAll(async () => {
    if (!app) return;
    await teardownServer(app);
});

describe('review service', () => {
    it('responds 400 when no payload', async () => {
        const response = await request('/api/v1/review', {
            method: 'post',
        });

        expect(response.status).toBe(400);
    });

    it('responds 400 on empty payload', async () => {
        const response = await request('/api/v1/review', {
            method: 'post',
            payload: {},
        });

        expect(response.status).toBe(400);
    });

    it('responds 400 on invalid payload', async () => {
        const response = await request('/api/v1/review', {
            method: 'post',
            payload: {
                test: 1,
            },
        });

        expect(response.status).toBe(400);
    });

    it('processes accept correctly', async () => {
        await request('/api/v1/report', {
            method: 'post',
            payload: {
                name: 'my-pipeline',
                commit_sha: 'f7d93421',
                branch_name: 'master',
                testcases: [
                    {
                        name: 'login flow',
                        status: 'passed',
                        group: 'portal.apps.auth.desktop',
                        diff_img: 'https://example.com/image.png',
                        result_img: 'https://example.com/image.png',
                    },
                    {
                        name: 'forgot password email',
                        status: 'failed',
                        group: 'portal.apps.auth.desktop',
                        diff_img: 'https://example.com/image.png',
                        result_img: 'https://example.com/image.png',
                    },
                ],
            },
        });

        const response = await request('/api/v1/review', {
            method: 'post',
            payload: {
                accepted: true,
                testcase_id: 2,
            },
        });

        expect(response.status).toBe(201);
        expect(response.json).toMatchInlineSnapshot(`
          {
            "message": "OK! Review processed",
          }
        `);

        const testcases = await request('/api/v1/testcases');

        expect(testcases.json).toMatchInlineSnapshot(
            {
                data: [
                    {
                        created_at: expectSqlTimestamp,
                        updated_at: expectSqlTimestamp,
                    },
                    {
                        accepted_at: expectSqlTimestamp,
                        created_at: expectSqlTimestamp,
                        updated_at: expectSqlTimestamp,
                    },
                ],
            }, `
          {
            "data": [
              {
                "accepted_at": null,
                "created_at": StringMatching /\\^\\\\d\\{4\\}-\\\\d\\{2\\}-\\\\d\\{2\\} \\\\d\\{2\\}:\\\\d\\{2\\}:\\\\d\\{2\\}\\$/,
                "diff_img": "https://example.com/image.png",
                "group": "portal.apps.auth.desktop",
                "id": 1,
                "name": "login flow",
                "pipeline_id": 1,
                "result_img": "https://example.com/image.png",
                "status": "passed",
                "unique_key": "11:my-pipeline|24:portal.apps.auth.desktop|10:login flow",
                "updated_at": StringMatching /\\^\\\\d\\{4\\}-\\\\d\\{2\\}-\\\\d\\{2\\} \\\\d\\{2\\}:\\\\d\\{2\\}:\\\\d\\{2\\}\\$/,
              },
              {
                "accepted_at": StringMatching /\\^\\\\d\\{4\\}-\\\\d\\{2\\}-\\\\d\\{2\\} \\\\d\\{2\\}:\\\\d\\{2\\}:\\\\d\\{2\\}\\$/,
                "created_at": StringMatching /\\^\\\\d\\{4\\}-\\\\d\\{2\\}-\\\\d\\{2\\} \\\\d\\{2\\}:\\\\d\\{2\\}:\\\\d\\{2\\}\\$/,
                "diff_img": "https://example.com/image.png",
                "group": "portal.apps.auth.desktop",
                "id": 2,
                "name": "forgot password email",
                "pipeline_id": 1,
                "result_img": "https://example.com/image.png",
                "status": "passed",
                "unique_key": "11:my-pipeline|24:portal.apps.auth.desktop|21:forgot password email",
                "updated_at": StringMatching /\\^\\\\d\\{4\\}-\\\\d\\{2\\}-\\\\d\\{2\\} \\\\d\\{2\\}:\\\\d\\{2\\}:\\\\d\\{2\\}\\$/,
              },
            ],
            "limit": 30,
            "skip": 0,
            "total": 2,
          }
        `);

        const baselines = await request('/api/v1/baselines');

        expect(baselines.json).toMatchInlineSnapshot(
            {
                data: [
                    {
                        created_at: expectSqlTimestamp,
                        updated_at: expectSqlTimestamp,
                    },
                ],
            }, `
          {
            "data": [
              {
                "baseline_img": "https://example.com/image.png",
                "created_at": StringMatching /\\^\\\\d\\{4\\}-\\\\d\\{2\\}-\\\\d\\{2\\} \\\\d\\{2\\}:\\\\d\\{2\\}:\\\\d\\{2\\}\\$/,
                "group": "portal.apps.auth.desktop",
                "id": 1,
                "name": "forgot password email",
                "pipeline_name": "my-pipeline",
                "unique_key": "11:my-pipeline|24:portal.apps.auth.desktop|21:forgot password email",
                "updated_at": StringMatching /\\^\\\\d\\{4\\}-\\\\d\\{2\\}-\\\\d\\{2\\} \\\\d\\{2\\}:\\\\d\\{2\\}:\\\\d\\{2\\}\\$/,
              },
            ],
            "limit": 30,
            "skip": 0,
            "total": 1,
          }
        `);

        await request('/api/v1/review', {
            method: 'post',
            payload: {
                accepted: true,
                testcase_id: 1,
            },
        });

        const testcases2 = await request('/api/v1/testcases');

        expect(testcases2.json).toMatchInlineSnapshot(
            {
                data: [
                    {
                        accepted_at: expectSqlTimestamp,
                        created_at: expectSqlTimestamp,
                        updated_at: expectSqlTimestamp,
                    },
                    {
                        accepted_at: expectSqlTimestamp,
                        created_at: expectSqlTimestamp,
                        updated_at: expectSqlTimestamp,
                    },
                ],
            }, `
          {
            "data": [
              {
                "accepted_at": StringMatching /\\^\\\\d\\{4\\}-\\\\d\\{2\\}-\\\\d\\{2\\} \\\\d\\{2\\}:\\\\d\\{2\\}:\\\\d\\{2\\}\\$/,
                "created_at": StringMatching /\\^\\\\d\\{4\\}-\\\\d\\{2\\}-\\\\d\\{2\\} \\\\d\\{2\\}:\\\\d\\{2\\}:\\\\d\\{2\\}\\$/,
                "diff_img": "https://example.com/image.png",
                "group": "portal.apps.auth.desktop",
                "id": 1,
                "name": "login flow",
                "pipeline_id": 1,
                "result_img": "https://example.com/image.png",
                "status": "passed",
                "unique_key": "11:my-pipeline|24:portal.apps.auth.desktop|10:login flow",
                "updated_at": StringMatching /\\^\\\\d\\{4\\}-\\\\d\\{2\\}-\\\\d\\{2\\} \\\\d\\{2\\}:\\\\d\\{2\\}:\\\\d\\{2\\}\\$/,
              },
              {
                "accepted_at": StringMatching /\\^\\\\d\\{4\\}-\\\\d\\{2\\}-\\\\d\\{2\\} \\\\d\\{2\\}:\\\\d\\{2\\}:\\\\d\\{2\\}\\$/,
                "created_at": StringMatching /\\^\\\\d\\{4\\}-\\\\d\\{2\\}-\\\\d\\{2\\} \\\\d\\{2\\}:\\\\d\\{2\\}:\\\\d\\{2\\}\\$/,
                "diff_img": "https://example.com/image.png",
                "group": "portal.apps.auth.desktop",
                "id": 2,
                "name": "forgot password email",
                "pipeline_id": 1,
                "result_img": "https://example.com/image.png",
                "status": "passed",
                "unique_key": "11:my-pipeline|24:portal.apps.auth.desktop|21:forgot password email",
                "updated_at": StringMatching /\\^\\\\d\\{4\\}-\\\\d\\{2\\}-\\\\d\\{2\\} \\\\d\\{2\\}:\\\\d\\{2\\}:\\\\d\\{2\\}\\$/,
              },
            ],
            "limit": 30,
            "skip": 0,
            "total": 2,
          }
        `);

        const baselines2 = await request('/api/v1/baselines');

        expect(baselines2.json).toMatchInlineSnapshot(
            {
                data: [
                    {
                        created_at: expectSqlTimestamp,
                        updated_at: expectSqlTimestamp,
                    },
                    {
                        created_at: expectSqlTimestamp,
                        updated_at: expectSqlTimestamp,
                    },
                ],
            }, `
          {
            "data": [
              {
                "baseline_img": "https://example.com/image.png",
                "created_at": StringMatching /\\^\\\\d\\{4\\}-\\\\d\\{2\\}-\\\\d\\{2\\} \\\\d\\{2\\}:\\\\d\\{2\\}:\\\\d\\{2\\}\\$/,
                "group": "portal.apps.auth.desktop",
                "id": 1,
                "name": "forgot password email",
                "pipeline_name": "my-pipeline",
                "unique_key": "11:my-pipeline|24:portal.apps.auth.desktop|21:forgot password email",
                "updated_at": StringMatching /\\^\\\\d\\{4\\}-\\\\d\\{2\\}-\\\\d\\{2\\} \\\\d\\{2\\}:\\\\d\\{2\\}:\\\\d\\{2\\}\\$/,
              },
              {
                "baseline_img": "https://example.com/image.png",
                "created_at": StringMatching /\\^\\\\d\\{4\\}-\\\\d\\{2\\}-\\\\d\\{2\\} \\\\d\\{2\\}:\\\\d\\{2\\}:\\\\d\\{2\\}\\$/,
                "group": "portal.apps.auth.desktop",
                "id": 2,
                "name": "login flow",
                "pipeline_name": "my-pipeline",
                "unique_key": "11:my-pipeline|24:portal.apps.auth.desktop|10:login flow",
                "updated_at": StringMatching /\\^\\\\d\\{4\\}-\\\\d\\{2\\}-\\\\d\\{2\\} \\\\d\\{2\\}:\\\\d\\{2\\}:\\\\d\\{2\\}\\$/,
              },
            ],
            "limit": 30,
            "skip": 0,
            "total": 2,
          }
        `);
    });

});
