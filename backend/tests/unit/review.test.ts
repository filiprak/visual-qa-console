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

describe('review service', () => {

    it('responds 401 when not authenticated', async () => {
        const response = await request('/api/v1/review', {
            method: 'POST',
        });

        expect(response.status).toBe(401);
    });

    it('responds 403 when no permissions', async () => {
        await login('empty');
        const response = await request('/api/v1/review', {
            method: 'POST',
        });

        expect(response.status).toBe(403);
    });

    it('responds 400 when no payload', async () => {
        await login('reviewer');
        const response = await request('/api/v1/review', {
            method: 'POST',
        });

        expect(response.status).toBe(400);
    });

    it('responds 400 on empty payload', async () => {
        await login('reviewer');
        const response = await request('/api/v1/review', {
            method: 'POST',
            payload: {},
        });

        expect(response.status).toBe(400);
    });

    it('responds 400 on invalid payload', async () => {
        await login('reviewer');
        const response = await request('/api/v1/review', {
            method: 'POST',
            payload: {
                test: 1,
            },
        });

        expect(response.status).toBe(400);
    });

    it('rollbacks on invalid testcase passed', async () => {
        await login('reviewer');
        await createSampleReport({ testcase_count: 2 });

        const response = await request('/api/v1/review', {
            method: 'POST',
            payload: {
                accepted: true,
                testcase_ids: [2, 9999],
            },
        });

        expect(response.json).toMatchInlineSnapshot(`
          {
            "className": "not-found",
            "code": 404,
            "message": "No record found for id '9999'",
            "name": "NotFound",
          }
        `);
        expect(response.status).toBe(404);

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
                "diff_img": "https://example.com/login-flow.diff.png",
                "failed_msg": null,
                "group": "portal.apps.auth.desktop",
                "id": 1,
                "name": "login flow",
                "pipeline_id": 1,
                "result_img": "https://example.com/login-flow.png",
                "status": "passed",
                "unique_key": "11:my-pipeline|24:portal.apps.auth.desktop|10:login flow",
                "updated_at": StringMatching /\\^\\\\d\\{4\\}-\\\\d\\{2\\}-\\\\d\\{2\\} \\\\d\\{2\\}:\\\\d\\{2\\}:\\\\d\\{2\\}\\$/,
              },
              {
                "accepted_at": null,
                "created_at": StringMatching /\\^\\\\d\\{4\\}-\\\\d\\{2\\}-\\\\d\\{2\\} \\\\d\\{2\\}:\\\\d\\{2\\}:\\\\d\\{2\\}\\$/,
                "diff_img": "https://example.com/forgot.diff.png",
                "failed_msg": "Different screenshots",
                "group": "portal.apps.auth.desktop",
                "id": 2,
                "name": "forgot password email",
                "pipeline_id": 1,
                "result_img": "https://example.com/forgot.png",
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
        await login('reviewer');
        await createSampleReport({ testcase_count: 2 });

        const response = await request('/api/v1/review', {
            method: 'POST',
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
            }, `
          {
            "data": [
              {
                "accepted_at": null,
                "created_at": StringMatching /\\^\\\\d\\{4\\}-\\\\d\\{2\\}-\\\\d\\{2\\} \\\\d\\{2\\}:\\\\d\\{2\\}:\\\\d\\{2\\}\\$/,
                "diff_img": "https://example.com/login-flow.diff.png",
                "failed_msg": null,
                "group": "portal.apps.auth.desktop",
                "id": 1,
                "name": "login flow",
                "pipeline_id": 1,
                "result_img": "https://example.com/login-flow.png",
                "status": "passed",
                "unique_key": "11:my-pipeline|24:portal.apps.auth.desktop|10:login flow",
                "updated_at": StringMatching /\\^\\\\d\\{4\\}-\\\\d\\{2\\}-\\\\d\\{2\\} \\\\d\\{2\\}:\\\\d\\{2\\}:\\\\d\\{2\\}\\$/,
              },
              {
                "accepted_at": StringMatching /\\^\\\\d\\{4\\}-\\\\d\\{2\\}-\\\\d\\{2\\} \\\\d\\{2\\}:\\\\d\\{2\\}:\\\\d\\{2\\}\\$/,
                "created_at": StringMatching /\\^\\\\d\\{4\\}-\\\\d\\{2\\}-\\\\d\\{2\\} \\\\d\\{2\\}:\\\\d\\{2\\}:\\\\d\\{2\\}\\$/,
                "diff_img": "https://example.com/forgot.diff.png",
                "failed_msg": "Different screenshots",
                "group": "portal.apps.auth.desktop",
                "id": 2,
                "name": "forgot password email",
                "pipeline_id": 1,
                "result_img": "https://example.com/forgot.png",
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
                "baseline_img": "https://example.com/forgot.png",
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
    });

    it('allows to skip baseline update', async () => {
        await login('reviewer');
        await createSampleReport({ testcase_count: 2 });

        const response = await request('/api/v1/review', {
            method: 'POST',
            payload: {
                accepted: true,
                skip_baseline_update: true,
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
            }, `
          {
            "data": [
              {
                "accepted_at": null,
                "created_at": StringMatching /\\^\\\\d\\{4\\}-\\\\d\\{2\\}-\\\\d\\{2\\} \\\\d\\{2\\}:\\\\d\\{2\\}:\\\\d\\{2\\}\\$/,
                "diff_img": "https://example.com/login-flow.diff.png",
                "failed_msg": null,
                "group": "portal.apps.auth.desktop",
                "id": 1,
                "name": "login flow",
                "pipeline_id": 1,
                "result_img": "https://example.com/login-flow.png",
                "status": "passed",
                "unique_key": "11:my-pipeline|24:portal.apps.auth.desktop|10:login flow",
                "updated_at": StringMatching /\\^\\\\d\\{4\\}-\\\\d\\{2\\}-\\\\d\\{2\\} \\\\d\\{2\\}:\\\\d\\{2\\}:\\\\d\\{2\\}\\$/,
              },
              {
                "accepted_at": StringMatching /\\^\\\\d\\{4\\}-\\\\d\\{2\\}-\\\\d\\{2\\} \\\\d\\{2\\}:\\\\d\\{2\\}:\\\\d\\{2\\}\\$/,
                "created_at": StringMatching /\\^\\\\d\\{4\\}-\\\\d\\{2\\}-\\\\d\\{2\\} \\\\d\\{2\\}:\\\\d\\{2\\}:\\\\d\\{2\\}\\$/,
                "diff_img": "https://example.com/forgot.diff.png",
                "failed_msg": "Different screenshots",
                "group": "portal.apps.auth.desktop",
                "id": 2,
                "name": "forgot password email",
                "pipeline_id": 1,
                "result_img": "https://example.com/forgot.png",
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

        expect(baselines.json).toMatchInlineSnapshot(`
          {
            "data": [],
            "limit": 30,
            "skip": 0,
            "total": 0,
          }
        `);
    });

    it('processes batch accept correctly', async () => {
        await login('reviewer');
        await createSampleReport({ testcase_count: 2 });

        const response = await request('/api/v1/review', {
            method: 'POST',
            payload: {
                accepted: true,
                testcase_ids: [1, 2],
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
                "diff_img": "https://example.com/login-flow.diff.png",
                "failed_msg": null,
                "group": "portal.apps.auth.desktop",
                "id": 1,
                "name": "login flow",
                "pipeline_id": 1,
                "result_img": "https://example.com/login-flow.png",
                "status": "passed",
                "unique_key": "11:my-pipeline|24:portal.apps.auth.desktop|10:login flow",
                "updated_at": StringMatching /\\^\\\\d\\{4\\}-\\\\d\\{2\\}-\\\\d\\{2\\} \\\\d\\{2\\}:\\\\d\\{2\\}:\\\\d\\{2\\}\\$/,
              },
              {
                "accepted_at": StringMatching /\\^\\\\d\\{4\\}-\\\\d\\{2\\}-\\\\d\\{2\\} \\\\d\\{2\\}:\\\\d\\{2\\}:\\\\d\\{2\\}\\$/,
                "created_at": StringMatching /\\^\\\\d\\{4\\}-\\\\d\\{2\\}-\\\\d\\{2\\} \\\\d\\{2\\}:\\\\d\\{2\\}:\\\\d\\{2\\}\\$/,
                "diff_img": "https://example.com/forgot.diff.png",
                "failed_msg": "Different screenshots",
                "group": "portal.apps.auth.desktop",
                "id": 2,
                "name": "forgot password email",
                "pipeline_id": 1,
                "result_img": "https://example.com/forgot.png",
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
                ],
            }, `
          {
            "data": [
              {
                "baseline_img": "https://example.com/login-flow.png",
                "created_at": StringMatching /\\^\\\\d\\{4\\}-\\\\d\\{2\\}-\\\\d\\{2\\} \\\\d\\{2\\}:\\\\d\\{2\\}:\\\\d\\{2\\}\\$/,
                "group": "portal.apps.auth.desktop",
                "id": 1,
                "name": "login flow",
                "pipeline_name": "my-pipeline",
                "unique_key": "11:my-pipeline|24:portal.apps.auth.desktop|10:login flow",
                "updated_at": StringMatching /\\^\\\\d\\{4\\}-\\\\d\\{2\\}-\\\\d\\{2\\} \\\\d\\{2\\}:\\\\d\\{2\\}:\\\\d\\{2\\}\\$/,
              },
              {
                "baseline_img": "https://example.com/forgot.png",
                "created_at": StringMatching /\\^\\\\d\\{4\\}-\\\\d\\{2\\}-\\\\d\\{2\\} \\\\d\\{2\\}:\\\\d\\{2\\}:\\\\d\\{2\\}\\$/,
                "group": "portal.apps.auth.desktop",
                "id": 2,
                "name": "forgot password email",
                "pipeline_name": "my-pipeline",
                "unique_key": "11:my-pipeline|24:portal.apps.auth.desktop|21:forgot password email",
                "updated_at": StringMatching /\\^\\\\d\\{4\\}-\\\\d\\{2\\}-\\\\d\\{2\\} \\\\d\\{2\\}:\\\\d\\{2\\}:\\\\d\\{2\\}\\$/,
              },
            ],
            "limit": 30,
            "skip": 0,
            "total": 2,
          }
        `);
    });

    it('do not add new baseline when already exists', async () => {
        await login('reviewer');
        await createSampleReport({ testcase_count: 2 });

        await request('/api/v1/review', {
            method: 'POST',
            payload: {
                accepted: true,
                testcase_ids: [2],
            },
        });

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
                "baseline_img": "https://example.com/forgot.png",
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
            method: 'POST',
            payload: {
                accepted: true,
                testcase_ids: [2],
            },
        });

        const baselines2 = await request('/api/v1/baselines');
        expect(baselines2.json).toMatchInlineSnapshot(
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
                "baseline_img": "https://example.com/forgot.png",
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
    });
});
