import type { Application } from '../../src/declarations.js';
import { request, setupServer, teardownServer } from '../utils.js';

let app: Application;

beforeAll(async () => {
    app = await setupServer();
})

afterAll(async () => {
    await teardownServer(app);
})

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
                test: 1
            },
        });

        expect(response.status).toBe(400);
    });

    it('responds 200 on valid payload', async () => {
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
    });

});