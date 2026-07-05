import { group } from 'node:console';
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

describe('baseline-match service', () => {
    it('responds 400 when invalid payload', async () => {
        const response = await request('/api/v1/baselines/match', {
            method: 'post',
        });

        expect(response.status).toBe(400);
    });

    it('responds without baselines when no baselines in db', async () => {
        const response = await request('/api/v1/baselines/match', {
            method: 'post',
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
        await request('/api/v1/review', {
            method: 'post',
            payload: {
                accepted: true,
                testcase_ids: [1],
            },
        });
        await request('/api/v1/review', {
            method: 'post',
            payload: {
                accepted: true,
                testcase_ids: [2],
            },
        });
        const response = await request('/api/v1/baselines/match', {
            method: 'post',
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
            },
            `
          {
            "baseline": {
              "baseline_img": "https://example.com/image.png",
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
        `,
        );
        expect(response.json[1]).toMatchInlineSnapshot(
            {
                baseline: {
                    created_at: expectSqlTimestamp,
                    updated_at: expectSqlTimestamp,
                },
            },
            `
          {
            "baseline": {
              "baseline_img": "https://example.com/image.png",
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
        `,
        );

        const response2 = await request('/api/v1/baselines/match', {
            method: 'post',
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
        await request('/api/v1/review', {
            method: 'post',
            payload: {
                accepted: true,
                testcase_ids: [1],
            },
        });
        await request('/api/v1/review', {
            method: 'post',
            payload: {
                accepted: true,
                testcase_ids: [2],
            },
        });
        const response = await request('/api/v1/baselines/match', {
            method: 'post',
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
            },
            `
          {
            "baseline": {
              "baseline_img": "https://example.com/image.png",
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
        `,
        );
        expect(response.json[1]).toMatchInlineSnapshot(
            {
                baseline: {
                    created_at: expectSqlTimestamp,
                    updated_at: expectSqlTimestamp,
                },
            },
            `
          {
            "baseline": {
              "baseline_img": "https://example.com/image.png",
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
        `,
        );
    });
});
