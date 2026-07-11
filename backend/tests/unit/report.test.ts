import type { Application } from '../../src/declarations.js';
import { createSampleReport } from '../seed.js';
import { clearDb, expectSqlTimestamp, logout, request, setupServer, teardownServer } from '../utils.js';

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

describe('report service', () => {
    it('responds 400 when no payload', async () => {
        const response = await request('/api/v1/report', {
            method: 'POST',
        });

        expect(response.status).toBe(400);
    });

    it('responds 400 on empty payload', async () => {
        const response = await request('/api/v1/report', {
            method: 'POST',
            payload: {},
        });

        expect(response.status).toBe(400);
    });

    it('responds 400 on invalid payload', async () => {
        const response = await request('/api/v1/report', {
            method: 'POST',
            payload: {
                test: 1,
            },
        });

        expect(response.status).toBe(400);
    });

    it('responds 200 on valid payload and process report correctly', async () => {
        const response = await request('/api/v1/report', {
            method: 'POST',
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
                        failed_msg: 'Different screenshots',
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
            },
            `
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
        `,
        );

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
                "accepted_at": null,
                "created_at": StringMatching /\\^\\\\d\\{4\\}-\\\\d\\{2\\}-\\\\d\\{2\\} \\\\d\\{2\\}:\\\\d\\{2\\}:\\\\d\\{2\\}\\$/,
                "diff_img": "https://example.com/image.png",
                "failed_msg": "Different screenshots",
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
        `,
        );
    });

    it('merges into existing pipeline if matching', async () => {
        await createSampleReport({
            pipeline_name: 'my-pipeline',
            commit_sha: 'f7d93421',
            branch_name: 'master',
            testcase_count: 2,
        });

        const response = await request('/api/v1/report', {
            method: 'POST',
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
                        name: 'signup flow',
                        status: 'failed',
                        failed_msg: 'Failed to load baseline image',
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
            },
            `
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
        `,
        );

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
                "failed_msg": null,
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
              {
                "accepted_at": null,
                "created_at": StringMatching /\\^\\\\d\\{4\\}-\\\\d\\{2\\}-\\\\d\\{2\\} \\\\d\\{2\\}:\\\\d\\{2\\}:\\\\d\\{2\\}\\$/,
                "diff_img": "https://example.com/signup.png",
                "failed_msg": "Failed to load baseline image",
                "group": "portal.apps.auth.desktop",
                "id": 4,
                "name": "signup flow",
                "pipeline_id": 1,
                "result_img": "https://example.com/signup.png",
                "status": "failed",
                "unique_key": "11:my-pipeline|24:portal.apps.auth.desktop|11:signup flow",
                "updated_at": StringMatching /\\^\\\\d\\{4\\}-\\\\d\\{2\\}-\\\\d\\{2\\} \\\\d\\{2\\}:\\\\d\\{2\\}:\\\\d\\{2\\}\\$/,
              },
            ],
            "limit": 30,
            "skip": 0,
            "total": 3,
          }
        `);
    });

    it('creates new pipeline and testcases on new commit hash', async () => {
        await createSampleReport({
            pipeline_name: 'my-pipeline',
            commit_sha: 'f7d93421',
            branch_name: 'master',
            testcase_count: 2,
        });
        const response = await request('/api/v1/report', {
            method: 'POST',
            payload: {
                name: 'my-pipeline',
                commit_sha: 'b6f87305',
                branch_name: 'master',
                testcases: [
                    {
                        name: 'login flow',
                        status: 'passed',
                        group: 'portal.apps.auth.desktop',
                        diff_img: 'https://example.com/image1.png',
                        result_img: 'https://example.com/image1.png',
                    },
                    {
                        name: 'signup',
                        status: 'passed',
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
              {
                "branch_name": "master",
                "commit_sha": "b6f87305",
                "created_at": StringMatching /\\^\\\\d\\{4\\}-\\\\d\\{2\\}-\\\\d\\{2\\} \\\\d\\{2\\}:\\\\d\\{2\\}:\\\\d\\{2\\}\\$/,
                "details": {
                  "failed": 0,
                  "groups": 1,
                  "passed": 2,
                  "status": "passed",
                  "total": 2,
                },
                "id": 2,
                "name": "my-pipeline",
                "updated_at": StringMatching /\\^\\\\d\\{4\\}-\\\\d\\{2\\}-\\\\d\\{2\\} \\\\d\\{2\\}:\\\\d\\{2\\}:\\\\d\\{2\\}\\$/,
              },
            ],
            "limit": 30,
            "skip": 0,
            "total": 2,
          }
        `);

        const testcases = await request('/api/v1/testcases?pipeline_id=2');

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
                "diff_img": "https://example.com/image1.png",
                "failed_msg": null,
                "group": "portal.apps.auth.desktop",
                "id": 3,
                "name": "login flow",
                "pipeline_id": 2,
                "result_img": "https://example.com/image1.png",
                "status": "passed",
                "unique_key": "11:my-pipeline|24:portal.apps.auth.desktop|10:login flow",
                "updated_at": StringMatching /\\^\\\\d\\{4\\}-\\\\d\\{2\\}-\\\\d\\{2\\} \\\\d\\{2\\}:\\\\d\\{2\\}:\\\\d\\{2\\}\\$/,
              },
              {
                "accepted_at": null,
                "created_at": StringMatching /\\^\\\\d\\{4\\}-\\\\d\\{2\\}-\\\\d\\{2\\} \\\\d\\{2\\}:\\\\d\\{2\\}:\\\\d\\{2\\}\\$/,
                "diff_img": "https://example.com/signup.png",
                "failed_msg": null,
                "group": "portal.apps.auth.desktop",
                "id": 4,
                "name": "signup",
                "pipeline_id": 2,
                "result_img": "https://example.com/signup.png",
                "status": "passed",
                "unique_key": "11:my-pipeline|24:portal.apps.auth.desktop|6:signup",
                "updated_at": StringMatching /\\^\\\\d\\{4\\}-\\\\d\\{2\\}-\\\\d\\{2\\} \\\\d\\{2\\}:\\\\d\\{2\\}:\\\\d\\{2\\}\\$/,
              },
            ],
            "limit": 30,
            "skip": 0,
            "total": 2,
          }
        `);
    });

    it('creates default group', async () => {
        const response = await request('/api/v1/report', {
            method: 'POST',
            payload: {
                name: 'ui-tests',
                commit_sha: 'b6f87305',
                branch_name: 'master',
                testcases: [
                    {
                        name: 'button',
                        status: 'passed',
                        diff_img: 'https://example.com/button.diff.png',
                        result_img: 'https://example.com/button.png',
                    },
                    {
                        name: 'select',
                        status: 'passed',
                        diff_img: 'https://example.com/select.diff.png',
                        result_img: 'https://example.com/select.png',
                    },
                ],
            },
        });
        expect(response.status).toBe(201);

        const pipelines = await request('/api/v1/pipelines/1');

        expect(pipelines.json).toMatchInlineSnapshot(
            {
                created_at: expectSqlTimestamp,
                updated_at: expectSqlTimestamp,
            }, `
          {
            "branch_name": "master",
            "commit_sha": "b6f87305",
            "created_at": StringMatching /\\^\\\\d\\{4\\}-\\\\d\\{2\\}-\\\\d\\{2\\} \\\\d\\{2\\}:\\\\d\\{2\\}:\\\\d\\{2\\}\\$/,
            "details": {
              "failed": 0,
              "groups": 1,
              "passed": 2,
              "status": "passed",
              "total": 2,
            },
            "id": 1,
            "name": "ui-tests",
            "updated_at": StringMatching /\\^\\\\d\\{4\\}-\\\\d\\{2\\}-\\\\d\\{2\\} \\\\d\\{2\\}:\\\\d\\{2\\}:\\\\d\\{2\\}\\$/,
          }
        `);

        const testcases = await request('/api/v1/testcases?pipeline_id=1');

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
                "diff_img": "https://example.com/button.diff.png",
                "failed_msg": null,
                "group": "default",
                "id": 1,
                "name": "button",
                "pipeline_id": 1,
                "result_img": "https://example.com/button.png",
                "status": "passed",
                "unique_key": "8:ui-tests|7:default|6:button",
                "updated_at": StringMatching /\\^\\\\d\\{4\\}-\\\\d\\{2\\}-\\\\d\\{2\\} \\\\d\\{2\\}:\\\\d\\{2\\}:\\\\d\\{2\\}\\$/,
              },
              {
                "accepted_at": null,
                "created_at": StringMatching /\\^\\\\d\\{4\\}-\\\\d\\{2\\}-\\\\d\\{2\\} \\\\d\\{2\\}:\\\\d\\{2\\}:\\\\d\\{2\\}\\$/,
                "diff_img": "https://example.com/select.diff.png",
                "failed_msg": null,
                "group": "default",
                "id": 2,
                "name": "select",
                "pipeline_id": 1,
                "result_img": "https://example.com/select.png",
                "status": "passed",
                "unique_key": "8:ui-tests|7:default|6:select",
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
