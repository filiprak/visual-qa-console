import type { Application } from '../../src/declarations.js';
import { expectSqlTimestamp, request, setupServer, teardownServer } from '../utils.js';

let app: Application;

beforeAll(async () => {
    app = await setupServer();
});

afterAll(async () => {
    await teardownServer(app);
});

describe('report service', () => {
    it('responds 400 when no payload', async () => {
        const response = await request('/api/v1/report', {
            method: 'post',
        });

        expect(response.status).toBe(400);
    });

    it('responds 400 on empty payload', async () => {
        const response = await request('/api/v1/report', {
            method: 'post',
            payload: {},
        });

        expect(response.status).toBe(400);
    });

    it('responds 400 on invalid payload', async () => {
        const response = await request('/api/v1/report', {
            method: 'post',
            payload: {
                test: 1,
            },
        });

        expect(response.status).toBe(400);
    });

    it('responds 200 on valid payload and process report correctly', async () => {
        const response = await request('/api/v1/report', {
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

        expect(response.json).toMatchInlineSnapshot(`
          {
            "message": "OK! Report received",
          }
        `);
        expect(response.status).toBe(201);

        const pipelines = await request('/api/v1/pipelines');

        expect(pipelines.json).toMatchInlineSnapshot(
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
                "branch_name": "master",
                "commit_sha": "f7d93421",
                "created_at": StringMatching /\\^\\\\d\\{4\\}-\\\\d\\{2\\}-\\\\d\\{2\\} \\\\d\\{2\\}:\\\\d\\{2\\}:\\\\d\\{2\\}\\$/,
                "details": {
                  "failed": 1,
                  "groups": 1,
                  "passed": 1,
                  "status": "failed",
                  "total": 2,
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
    });

    it('merges into existing pipeline if matching', async () => {
        const response = await request('/api/v1/report', {
            method: 'post',
            payload: {
                name: 'my-pipeline',
                commit_sha: 'f7d93421',
                branch_name: 'master',
                testcases: [
                    {
                        name: 'login flow',
                        status: 'failed',
                        group: 'portal.apps.auth.desktop',
                        diff_img: 'https://example.com/image1.png',
                        result_img: 'https://example.com/image1.png',
                    },
                    {
                        name: 'signup',
                        status: 'failed',
                        group: 'portal.apps.auth.desktop',
                        diff_img: 'https://example.com/signup.png',
                        result_img: 'https://example.com/signup.png',
                    },
                ],
            },
        });
        expect(response.status).toBe(201);

        const pipelines = await request('/api/v1/pipelines');

        expect(pipelines.json).toMatchInlineSnapshot(
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
                "branch_name": "master",
                "commit_sha": "f7d93421",
                "created_at": StringMatching /\\^\\\\d\\{4\\}-\\\\d\\{2\\}-\\\\d\\{2\\} \\\\d\\{2\\}:\\\\d\\{2\\}:\\\\d\\{2\\}\\$/,
                "details": {
                  "failed": 3,
                  "groups": 1,
                  "passed": 0,
                  "status": "failed",
                  "total": 3,
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
                "diff_img": "https://example.com/image1.png",
                "group": "portal.apps.auth.desktop",
                "id": 1,
                "name": "login flow",
                "pipeline_id": 1,
                "result_img": "https://example.com/image1.png",
                "status": "failed",
                "unique_key": "11:my-pipeline|24:portal.apps.auth.desktop|10:login flow",
                "updated_at": StringMatching /\\^\\\\d\\{4\\}-\\\\d\\{2\\}-\\\\d\\{2\\} \\\\d\\{2\\}:\\\\d\\{2\\}:\\\\d\\{2\\}\\$/,
              },
              {
                "accepted_at": null,
                "created_at": StringMatching /\\^\\\\d\\{4\\}-\\\\d\\{2\\}-\\\\d\\{2\\} \\\\d\\{2\\}:\\\\d\\{2\\}:\\\\d\\{2\\}\\$/,
                "diff_img": "https://example.com/image.png",
                "group": "portal.apps.auth.desktop",
                "id": 2,
                "name": "forgot password email",
                "pipeline_id": 1,
                "result_img": "https://example.com/image.png",
                "status": "failed",
                "unique_key": "11:my-pipeline|24:portal.apps.auth.desktop|21:forgot password email",
                "updated_at": StringMatching /\\^\\\\d\\{4\\}-\\\\d\\{2\\}-\\\\d\\{2\\} \\\\d\\{2\\}:\\\\d\\{2\\}:\\\\d\\{2\\}\\$/,
              },
              {
                "accepted_at": null,
                "created_at": StringMatching /\\^\\\\d\\{4\\}-\\\\d\\{2\\}-\\\\d\\{2\\} \\\\d\\{2\\}:\\\\d\\{2\\}:\\\\d\\{2\\}\\$/,
                "diff_img": "https://example.com/signup.png",
                "group": "portal.apps.auth.desktop",
                "id": 4,
                "name": "signup",
                "pipeline_id": 1,
                "result_img": "https://example.com/signup.png",
                "status": "failed",
                "unique_key": "11:my-pipeline|24:portal.apps.auth.desktop|6:signup",
                "updated_at": StringMatching /\\^\\\\d\\{4\\}-\\\\d\\{2\\}-\\\\d\\{2\\} \\\\d\\{2\\}:\\\\d\\{2\\}:\\\\d\\{2\\}\\$/,
              },
            ],
            "limit": 30,
            "skip": 0,
            "total": 3,
          }
        `);
    });
});
