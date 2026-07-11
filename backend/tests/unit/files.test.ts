import type { Application } from '../../src/declarations.js';
import { createSampleReport } from '../seed.js';
import { clearDb, login, logout, request, setupServer, teardownServer } from '../utils.js';

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

describe('files service', () => {

    it('responds error when no urls passed', async () => {
        const response = await request('/api/v1/files', {
            method: 'POST',
        });

        expect(response.status).toBe(400);
    });

    it('responds no match when db empty', async () => {
        const response = await request('/api/v1/files', {
            method: 'POST',
            payload: [
                { url: 'https://example.com/image1.png' },
                { url: 'https://example.com/image2.png' },
            ],
        });

        expect(response.json).toMatchInlineSnapshot(`
          {
            "https://example.com/image1.png": false,
            "https://example.com/image2.png": false,
          }
        `);
    });

    it('responds no match when urls unused', async () => {
        await createSampleReport();

        const response = await request('/api/v1/files', {
            method: 'POST',
            payload: [
                { url: 'https://example.com/image1.png' },
                { url: 'https://example.com/image2.png' },
            ],
        });

        expect(response.json).toMatchInlineSnapshot(`
          {
            "https://example.com/image1.png": false,
            "https://example.com/image2.png": false,
          }
        `);
    });

    it('responds true when file used in testcase', async () => {
        await createSampleReport();

        const response = await request('/api/v1/files', {
            method: 'POST',
            payload: [
                { url: 'https://example.com/login-flow.diff.png' },
                { url: 'https://example.com/login-flow.png' },
                { url: 'https://example.com/invalid-password.png' },
                { url: 'https://example.com/x.png' },
            ],
        });

        expect(response.json).toMatchInlineSnapshot(`
          {
            "https://example.com/invalid-password.png": true,
            "https://example.com/login-flow.diff.png": true,
            "https://example.com/login-flow.png": true,
            "https://example.com/x.png": false,
          }
        `);
    });

    it('responds true when file used only in baseline', async () => {
        await login('reviewer');
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
                        status: 'failed',
                        failed_msg: 'Different screenshots',
                        group: 'portal.apps.auth.desktop',
                        diff_img: 'https://example.com/forgot.diff.png',
                        result_img: 'https://example.com/forgot.png',
                    },
                ],
            },
        });
        await request('/api/v1/review', {
            method: 'POST',
            payload: {
                accepted: true,
                testcase_ids: [1, 2],
            },
        });
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
                        diff_img: 'https://example.com/x.png',
                        result_img: 'https://example.com/x.png',
                    },
                    {
                        name: 'forgot password email',
                        status: 'failed',
                        failed_msg: 'Different screenshots',
                        group: 'portal.apps.auth.desktop',
                        diff_img: 'https://example.com/x.png',
                        result_img: 'https://example.com/x.png',
                    },
                ],
            },
        });

        const response = await request('/api/v1/files', {
            method: 'POST',
            payload: [
                { url: 'https://example.com/forgot.png' },
                { url: 'https://example.com/login-flow.png' },
                { url: 'https://example.com/x.png' },
                { url: 'https://example.com/login-flow.diff.png' },
                { url: 'https://example.com/forgot.diff.png' },
                { url: 'https://example.com/y.png' },
            ],
        });

        expect(response.json).toMatchInlineSnapshot(`
          {
            "https://example.com/forgot.diff.png": false,
            "https://example.com/forgot.png": true,
            "https://example.com/login-flow.diff.png": false,
            "https://example.com/login-flow.png": true,
            "https://example.com/x.png": true,
            "https://example.com/y.png": false,
          }
        `);
    });

});
