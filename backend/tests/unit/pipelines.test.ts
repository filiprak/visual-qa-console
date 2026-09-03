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

        // Report marks testcases as `new` when no baseline exists,
        // so set the intended statuses explicitly for pipeline aggregation.
        await login('reviewer');
        await request('/api/v1/review', {
            method: 'POST',
            payload: { status: 'passed', testcase_ids: [1, 3] },
        });
        await request('/api/v1/review', {
            method: 'POST',
            payload: { status: 'failed', testcase_ids: [2, 4] },
        });
        await logout();

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
                  "approved": 0,
                  "failed": 2,
                  "groups": 2,
                  "new": 0,
                  "passed": 2,
                  "reported": 0,
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

    it('computes valid pipeline status - all passed', async () => {
        await request('/api/v1/report', {
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
                        diff_img: 'https://example.com/login-flow.diff.png',
                        result_img: 'https://example.com/login-flow.png',
                    },
                    {
                        name: 'forgot password email',
                        status: 'passed',
                        failed_msg: 'Different screenshots',
                        group: 'portal.apps.auth.desktop',
                        diff_img: 'https://example.com/forgot.diff.png',
                        result_img: 'https://example.com/forgot.png',
                    },
                    {
                        name: 'invalid password',
                        status: 'passed',
                        group: 'portal.apps.auth.signup',
                        diff_img: 'https://example.com/invalid-password.diff.png',
                        result_img: 'https://example.com/invalid-password.png',
                    },
                    {
                        name: 'invalid email',
                        status: 'approved',
                        group: 'portal.apps.auth.signup',
                        diff_img: 'https://example.com/invalid-email.diff.png',
                        result_img: 'https://example.com/invalid-email.png',
                    },
                ],
            },
        });

        // Report marks testcases as `new` when no baseline exists,
        // so set the intended statuses explicitly for pipeline aggregation.
        await login('reviewer');
        await request('/api/v1/review', {
            method: 'POST',
            payload: { status: 'passed', testcase_ids: [1, 2, 3] },
        });
        await request('/api/v1/review', {
            method: 'POST',
            payload: { status: 'approved', testcase_ids: [4] },
        });
        await logout();

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
                  "approved": 1,
                  "failed": 0,
                  "groups": 2,
                  "new": 0,
                  "passed": 3,
                  "reported": 0,
                  "status": "passed",
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

    it('computes valid pipeline status - some new cases', async () => {
        await request('/api/v1/report', {
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
                        diff_img: 'https://example.com/login-flow.diff.png',
                        result_img: 'https://example.com/login-flow.png',
                    },
                    {
                        name: 'forgot password email',
                        status: 'new',
                        failed_msg: 'Different screenshots',
                        group: 'portal.apps.auth.desktop',
                        diff_img: 'https://example.com/forgot.diff.png',
                        result_img: 'https://example.com/forgot.png',
                    },
                    {
                        name: 'invalid password',
                        status: 'new',
                        group: 'portal.apps.auth.signup',
                        diff_img: 'https://example.com/invalid-password.diff.png',
                        result_img: 'https://example.com/invalid-password.png',
                    },
                    {
                        name: 'invalid email',
                        status: 'passed',
                        group: 'portal.apps.auth.signup',
                        diff_img: 'https://example.com/invalid-email.diff.png',
                        result_img: 'https://example.com/invalid-email.png',
                    },
                ],
            },
        });

        // Report marks testcases as `new` when no baseline exists,
        // so set the intended statuses explicitly for pipeline aggregation.
        await login('reviewer');
        await request('/api/v1/review', {
            method: 'POST',
            payload: { status: 'passed', testcase_ids: [1, 4] },
        });
        await logout();

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
                  "approved": 0,
                  "failed": 0,
                  "groups": 2,
                  "new": 2,
                  "passed": 2,
                  "reported": 0,
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

    it('computes valid pipeline status - some reported cases', async () => {
        await request('/api/v1/report', {
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
                        diff_img: 'https://example.com/login-flow.diff.png',
                        result_img: 'https://example.com/login-flow.png',
                    },
                    {
                        name: 'forgot password email',
                        status: 'reported',
                        failed_msg: 'Different screenshots',
                        group: 'portal.apps.auth.desktop',
                        diff_img: 'https://example.com/forgot.diff.png',
                        result_img: 'https://example.com/forgot.png',
                    },
                    {
                        name: 'invalid password',
                        status: 'passed',
                        group: 'portal.apps.auth.signup',
                        diff_img: 'https://example.com/invalid-password.diff.png',
                        result_img: 'https://example.com/invalid-password.png',
                    },
                    {
                        name: 'invalid email',
                        status: 'passed',
                        group: 'portal.apps.auth.signup',
                        diff_img: 'https://example.com/invalid-email.diff.png',
                        result_img: 'https://example.com/invalid-email.png',
                    },
                ],
            },
        });

        // Report marks testcases as `new` when no baseline exists,
        // so set the intended statuses explicitly for pipeline aggregation.
        await login('reviewer');
        await request('/api/v1/review', {
            method: 'POST',
            payload: { status: 'passed', testcase_ids: [1, 3, 4] },
        });
        await request('/api/v1/review', {
            method: 'POST',
            payload: { status: 'reported', testcase_ids: [2] },
        });
        await logout();

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
                  "approved": 0,
                  "failed": 0,
                  "groups": 2,
                  "new": 0,
                  "passed": 3,
                  "reported": 1,
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
