import type { Application } from '../../src/declarations.js';
import { clearDb, expectSqlTimestamp, login, logout, request, setupServer, teardownServer } from '../utils.js';
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

describe('baseline-match service', () => {
    it('responds 400 when invalid payload', async () => {
        const response = await request('/api/v1/baselines/match', {
            method: 'POST',
        });

        expect(response.status).toBe(400);
    });

    it('responds without baselines when no baselines in db', async () => {
        const response = await request('/api/v1/baselines/match', {
            method: 'POST',
            payload: {
                pipeline_name: 'my-pipeline',
                testcases: [
                    {
                        name: 'login flow',
                        group: 'portal.apps.auth.desktop',
                    },
                ],
            },
        });

        expect(response.status).toBe(201);
        expect(response.json).toMatchInlineSnapshot(`
          [
            {
              "group": "portal.apps.auth.desktop",
              "name": "login flow",
            },
          ]
        `);
    });

    it('matches baselines correctly', async () => {
        await login('reviewer');
        await createSampleReport();
        await request('/api/v1/review', {
            method: 'POST',
            payload: {
                accepted: true,
                testcase_ids: [1, 2],
            },
        });
        const response = await request('/api/v1/baselines/match', {
            method: 'POST',
            payload: {
                pipeline_name: 'my-pipeline',
                testcases: [
                    {
                        name: 'login flow',
                        group: 'portal.apps.auth.desktop',
                    },
                    {
                        name: 'forgot password email',
                        group: 'portal.apps.auth.desktop',
                    },
                ],
            },
        });

        expect(response.status).toBe(201);
        expect(response.json[0]).toMatchInlineSnapshot(
            {
                baseline: {
                    created_at: expectSqlTimestamp,
                    updated_at: expectSqlTimestamp,
                },
            }, `
          {
            "baseline": {
              "baseline_img": "https://example.com/login-flow.png",
              "created_at": StringMatching /\\^\\\\d\\{4\\}-\\\\d\\{2\\}-\\\\d\\{2\\} \\\\d\\{2\\}:\\\\d\\{2\\}:\\\\d\\{2\\}\\$/,
              "group": "portal.apps.auth.desktop",
              "id": 1,
              "name": "login flow",
              "pipeline_name": "my-pipeline",
              "unique_key": "11:my-pipeline|24:portal.apps.auth.desktop|10:login flow",
              "updated_at": StringMatching /\\^\\\\d\\{4\\}-\\\\d\\{2\\}-\\\\d\\{2\\} \\\\d\\{2\\}:\\\\d\\{2\\}:\\\\d\\{2\\}\\$/,
            },
            "group": "portal.apps.auth.desktop",
            "name": "login flow",
          }
        `);
        expect(response.json[1]).toMatchInlineSnapshot(
            {
                baseline: {
                    created_at: expectSqlTimestamp,
                    updated_at: expectSqlTimestamp,
                },
            }, `
          {
            "baseline": {
              "baseline_img": "https://example.com/forgot.png",
              "created_at": StringMatching /\\^\\\\d\\{4\\}-\\\\d\\{2\\}-\\\\d\\{2\\} \\\\d\\{2\\}:\\\\d\\{2\\}:\\\\d\\{2\\}\\$/,
              "group": "portal.apps.auth.desktop",
              "id": 2,
              "name": "forgot password email",
              "pipeline_name": "my-pipeline",
              "unique_key": "11:my-pipeline|24:portal.apps.auth.desktop|21:forgot password email",
              "updated_at": StringMatching /\\^\\\\d\\{4\\}-\\\\d\\{2\\}-\\\\d\\{2\\} \\\\d\\{2\\}:\\\\d\\{2\\}:\\\\d\\{2\\}\\$/,
            },
            "group": "portal.apps.auth.desktop",
            "name": "forgot password email",
          }
        `);

        const response2 = await request('/api/v1/baselines/match', {
            method: 'POST',
            payload: {
                pipeline_name: 'non-existing',
                testcases: [
                    {
                        name: 'login flow',
                        group: 'portal.apps.auth.desktop',
                    },
                    {
                        name: 'forgot password email',
                        group: 'portal.apps.auth.desktop',
                    },
                ],
            },
        });
        expect(response2.json).toMatchInlineSnapshot(`
          [
            {
              "group": "portal.apps.auth.desktop",
              "name": "login flow",
            },
            {
              "group": "portal.apps.auth.desktop",
              "name": "forgot password email",
            },
          ]
        `);
    });

    it('ignores case and whitespace characters when matching', async () => {
        await login('reviewer');
        await createSampleReport();
        await request('/api/v1/review', {
            method: 'POST',
            payload: {
                accepted: true,
                testcase_ids: [1, 2],
            },
        });

        const response = await request('/api/v1/baselines/match', {
            method: 'POST',
            payload: {
                pipeline_name: 'My-pipeline ',
                testcases: [
                    {
                        name: 'login  flow',
                        group: 'portal.apps.auth.desktop',
                    },
                    {
                        name: '  forgot password EMAil',
                        group: 'portal.apps.auth.desktop',
                    },
                ],
            },
        });

        expect(response.status).toBe(201);
        expect(response.json[0]).toMatchInlineSnapshot(
            {
                baseline: {
                    created_at: expectSqlTimestamp,
                    updated_at: expectSqlTimestamp,
                },
            }, `
          {
            "baseline": {
              "baseline_img": "https://example.com/login-flow.png",
              "created_at": StringMatching /\\^\\\\d\\{4\\}-\\\\d\\{2\\}-\\\\d\\{2\\} \\\\d\\{2\\}:\\\\d\\{2\\}:\\\\d\\{2\\}\\$/,
              "group": "portal.apps.auth.desktop",
              "id": 1,
              "name": "login flow",
              "pipeline_name": "my-pipeline",
              "unique_key": "11:my-pipeline|24:portal.apps.auth.desktop|10:login flow",
              "updated_at": StringMatching /\\^\\\\d\\{4\\}-\\\\d\\{2\\}-\\\\d\\{2\\} \\\\d\\{2\\}:\\\\d\\{2\\}:\\\\d\\{2\\}\\$/,
            },
            "group": "portal.apps.auth.desktop",
            "name": "login  flow",
          }
        `);
        expect(response.json[1]).toMatchInlineSnapshot(
            {
                baseline: {
                    created_at: expectSqlTimestamp,
                    updated_at: expectSqlTimestamp,
                },
            }, `
          {
            "baseline": {
              "baseline_img": "https://example.com/forgot.png",
              "created_at": StringMatching /\\^\\\\d\\{4\\}-\\\\d\\{2\\}-\\\\d\\{2\\} \\\\d\\{2\\}:\\\\d\\{2\\}:\\\\d\\{2\\}\\$/,
              "group": "portal.apps.auth.desktop",
              "id": 2,
              "name": "forgot password email",
              "pipeline_name": "my-pipeline",
              "unique_key": "11:my-pipeline|24:portal.apps.auth.desktop|21:forgot password email",
              "updated_at": StringMatching /\\^\\\\d\\{4\\}-\\\\d\\{2\\}-\\\\d\\{2\\} \\\\d\\{2\\}:\\\\d\\{2\\}:\\\\d\\{2\\}\\$/,
            },
            "group": "portal.apps.auth.desktop",
            "name": "  forgot password EMAil",
          }
        `);
    });
});
