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

    it('rollbacks on invalid testcase passed', async () => {
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
                testcase_ids: [2, 9999],
            },
        });

        expect(response.status).toBe(404);
        expect(response.json).toMatchInlineSnapshot(`
          {
            "className": "not-found",
            "code": 404,
            "message": "No record found for id '9999'",
            "name": "NotFound",
          }
        `);

        // expect unchanged testcases status
        const testcases = await request('/api/v1/testcases');

        expect(testcases.json).toMatchInlineSnapshot(
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
                "accepted_at": null,
                "created_at": StringMatching /\\^\\\\d\\{4\\}-\\\\d\\{2\\}-\\\\d\\{2\\} \\\\d\\{2\\}:\\\\d\\{2\\}:\\\\d\\{2\\}\\$/,
                "diff_img": "https://example.com/image.png",
                "failed_msg": null,
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
                "accepted_at": null,
                "created_at": StringMatching /\\^\\\\d\\{4\\}-\\\\d\\{2\\}-\\\\d\\{2\\} \\\\d\\{2\\}:\\\\d\\{2\\}:\\\\d\\{2\\}\\$/,
                "diff_img": "https://example.com/image.png",
                "failed_msg": null,
                "group": "portal.apps.auth.desktop",
                "id": 2,
                "name": "forgot password email",
                "pipeline_id": 1,
                "result_img": "https://example.com/image.png",
                "status": "failed",
                "unique_key": "11:my-pipeline|24:portal.apps.auth.desktop|21:forgot password email",
                "updated_at": StringMatching /\\^\\\\d\\{4\\}-\\\\d\\{2\\}-\\\\d\\{2\\} \\\\d\\{2\\}:\\\\d\\{2\\}:\\\\d\\{2\\}\\$/,
              },
            ],
            "limit": 30,
            "skip": 0,
            "total": 2,
          }
        `);

        // expect no baselines
        const baselines = await request('/api/v1/baselines');

        expect(baselines.json).toMatchInlineSnapshot(`
          {
            "data": [],
            "limit": 30,
            "skip": 0,
            "total": 0,
          }
        `);
    });

    it('processes simple accept correctly', async () => {
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
                testcase_ids: [2],
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
            },
            `
          {
            "data": [
              {
                "accepted_at": null,
                "created_at": StringMatching /\\^\\\\d\\{4\\}-\\\\d\\{2\\}-\\\\d\\{2\\} \\\\d\\{2\\}:\\\\d\\{2\\}:\\\\d\\{2\\}\\$/,
                "diff_img": "https://example.com/image.png",
                "failed_msg": null,
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
                "failed_msg": null,
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
        `,
        );

        const baselines = await request('/api/v1/baselines');

        expect(baselines.json).toMatchInlineSnapshot(
            {
                data: [
                    {
                        created_at: expectSqlTimestamp,
                        updated_at: expectSqlTimestamp,
                    },
                ],
            },
            `
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
        `,
        );

        await request('/api/v1/review', {
            method: 'post',
            payload: {
                accepted: true,
                testcase_ids: [1],
            },
        });
    });

    it('processes batch accept correctly', async () => {
        await request('/api/v1/report', {
            method: 'post',
            payload: {
                name: 'batch-pipeline',
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
                testcase_ids: [5, 6],
            },
        });

        expect(response.status).toBe(201);
        expect(response.json).toMatchInlineSnapshot(`
          {
            "message": "OK! Review processed",
          }
        `);

        const testcases = await request('/api/v1/testcases?pipeline_id=2');

        expect(testcases.json).toMatchInlineSnapshot(
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
                "failed_msg": null,
                "group": "portal.apps.auth.desktop",
                "id": 5,
                "name": "login flow",
                "pipeline_id": 2,
                "result_img": "https://example.com/image.png",
                "status": "passed",
                "unique_key": "14:batch-pipeline|24:portal.apps.auth.desktop|10:login flow",
                "updated_at": StringMatching /\\^\\\\d\\{4\\}-\\\\d\\{2\\}-\\\\d\\{2\\} \\\\d\\{2\\}:\\\\d\\{2\\}:\\\\d\\{2\\}\\$/,
              },
              {
                "accepted_at": StringMatching /\\^\\\\d\\{4\\}-\\\\d\\{2\\}-\\\\d\\{2\\} \\\\d\\{2\\}:\\\\d\\{2\\}:\\\\d\\{2\\}\\$/,
                "created_at": StringMatching /\\^\\\\d\\{4\\}-\\\\d\\{2\\}-\\\\d\\{2\\} \\\\d\\{2\\}:\\\\d\\{2\\}:\\\\d\\{2\\}\\$/,
                "diff_img": "https://example.com/image.png",
                "failed_msg": null,
                "group": "portal.apps.auth.desktop",
                "id": 6,
                "name": "forgot password email",
                "pipeline_id": 2,
                "result_img": "https://example.com/image.png",
                "status": "passed",
                "unique_key": "14:batch-pipeline|24:portal.apps.auth.desktop|21:forgot password email",
                "updated_at": StringMatching /\\^\\\\d\\{4\\}-\\\\d\\{2\\}-\\\\d\\{2\\} \\\\d\\{2\\}:\\\\d\\{2\\}:\\\\d\\{2\\}\\$/,
              },
            ],
            "limit": 30,
            "skip": 0,
            "total": 2,
          }
        `);

        // expect both baselines accepted
        const baselines = await request('/api/v1/baselines');

        expect(baselines.json).toMatchInlineSnapshot(
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
              {
                "baseline_img": "https://example.com/image.png",
                "created_at": StringMatching /\\^\\\\d\\{4\\}-\\\\d\\{2\\}-\\\\d\\{2\\} \\\\d\\{2\\}:\\\\d\\{2\\}:\\\\d\\{2\\}\\$/,
                "group": "portal.apps.auth.desktop",
                "id": 3,
                "name": "login flow",
                "pipeline_name": "batch-pipeline",
                "unique_key": "14:batch-pipeline|24:portal.apps.auth.desktop|10:login flow",
                "updated_at": StringMatching /\\^\\\\d\\{4\\}-\\\\d\\{2\\}-\\\\d\\{2\\} \\\\d\\{2\\}:\\\\d\\{2\\}:\\\\d\\{2\\}\\$/,
              },
              {
                "baseline_img": "https://example.com/image.png",
                "created_at": StringMatching /\\^\\\\d\\{4\\}-\\\\d\\{2\\}-\\\\d\\{2\\} \\\\d\\{2\\}:\\\\d\\{2\\}:\\\\d\\{2\\}\\$/,
                "group": "portal.apps.auth.desktop",
                "id": 4,
                "name": "forgot password email",
                "pipeline_name": "batch-pipeline",
                "unique_key": "14:batch-pipeline|24:portal.apps.auth.desktop|21:forgot password email",
                "updated_at": StringMatching /\\^\\\\d\\{4\\}-\\\\d\\{2\\}-\\\\d\\{2\\} \\\\d\\{2\\}:\\\\d\\{2\\}:\\\\d\\{2\\}\\$/,
              },
            ],
            "limit": 30,
            "skip": 0,
            "total": 4,
          }
        `);
    });
});
