import type { Application } from '../../src/declarations.js';
import { clearDb, request, login, setupServer, teardownServer, logout } from '../utils.js';

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

const validReportIssue = {
    base_url: 'https://jira.example.com/browse/new',
    params: [
        { key: 'summary', value: 'Fix visual test {GROUP}/{TEST}' },
        { key: 'description', value: 'Baseline: {BASELINE_URL} Diff: {DIFF_URL} Actual: {ACTUAL_URL}' },
    ],
};

describe('settings service', () => {

    it('allows public read of empty settings list', async () => {
        const response = await request('/api/v1/settings', {
            method: 'GET',
        });
        expect(response.status).toBe(200);
        expect(response.json.data).toEqual([]);
    });

    it('returns 404 for missing key', async () => {
        const response = await request('/api/v1/settings/report_issue', {
            method: 'GET',
        });
        expect(response.status).toBe(404);
    });

    it('does not allow to create/patch/remove settings without auth', async () => {
        const createRes = await request('/api/v1/settings', {
            method: 'POST',
            payload: { key: 'report_issue', value: validReportIssue },
        });
        expect(createRes.status).toBe(401);

        const patchRes = await request('/api/v1/settings/report_issue', {
            method: 'PATCH',
            payload: { value: validReportIssue },
        });
        expect(patchRes.status).toBe(401);

        const removeRes = await request('/api/v1/settings/report_issue', {
            method: 'DELETE',
        });
        expect(removeRes.status).toBe(401);
    });

    it('does not allow non-admin users to create/patch/remove settings', async () => {
        for (const username of ['empty', 'reviewer', 'full'] as const) {
            await login(username);

            const createRes = await request('/api/v1/settings', {
                method: 'POST',
                payload: { key: 'report_issue', value: validReportIssue },
            });
            expect(createRes.status).toBe(403);
            expect(createRes.statusText).toBe('Forbidden');

            const patchRes = await request('/api/v1/settings/report_issue', {
                method: 'PATCH',
                payload: { value: validReportIssue },
            });
            expect(patchRes.status).toBe(403);

            const removeRes = await request('/api/v1/settings/report_issue', {
                method: 'DELETE',
            });
            expect(removeRes.status).toBe(403);

            await logout();
        }
    });

    it('allows non-admin users to read settings', async () => {
        await login('admin');
        await request('/api/v1/settings', {
            method: 'POST',
            payload: { key: 'report_issue', value: validReportIssue },
        });
        await logout();

        await login('reviewer');
        const getRes = await request('/api/v1/settings/report_issue', {
            method: 'GET',
        });
        expect(getRes.status).toBe(200);
        expect(getRes.json.value).toMatchObject(validReportIssue);

        const findRes = await request('/api/v1/settings', {
            method: 'GET',
        });
        expect(findRes.status).toBe(200);
        expect(findRes.json.data.length).toBe(1);
        await logout();
    });

    it('allows admin to create, get, find, patch and remove settings', async () => {
        await login('admin');

        const createRes = await request('/api/v1/settings', {
            method: 'POST',
            payload: { key: 'report_issue', value: validReportIssue },
        });
        expect(createRes.status).toBe(201);
        expect(createRes.json.key).toBe('report_issue');
        expect(createRes.json.value).toMatchObject(validReportIssue);

        const getRes = await request('/api/v1/settings/report_issue', {
            method: 'GET',
        });
        expect(getRes.status).toBe(200);
        expect(getRes.json.value).toMatchObject(validReportIssue);

        const findRes = await request('/api/v1/settings', {
            method: 'GET',
        });
        expect(findRes.status).toBe(200);
        expect(findRes.json.data.length).toBe(1);

        const updated = {
            base_url: 'https://gitlab.example.com/issues/new',
            params: [{ key: 'issue[title]', value: 'Fix {TEST}' }],
        };
        const patchRes = await request('/api/v1/settings/report_issue', {
            method: 'PATCH',
            payload: { value: updated },
        });
        expect(patchRes.status).toBe(200);
        expect(patchRes.json.value).toMatchObject(updated);

        const removeRes = await request('/api/v1/settings/report_issue', {
            method: 'DELETE',
        });
        expect(removeRes.status).toBe(200);

        const getAfterRemove = await request('/api/v1/settings/report_issue', {
            method: 'GET',
        });
        expect(getAfterRemove.status).toBe(404);
    });

    it('rejects invalid report_issue values', async () => {
        await login('admin');

        const badBaseUrl = await request('/api/v1/settings', {
            method: 'POST',
            payload: { key: 'report_issue', value: { base_url: 'not-a-url', params: [] } },
        });
        expect(badBaseUrl.status).toBe(400);

        const badParam = await request('/api/v1/settings', {
            method: 'POST',
            payload: { key: 'report_issue', value: { base_url: 'https://example.com', params: [{ key: '', value: 'x' }] } },
        });
        expect(badParam.status).toBe(400);

        const duplicateKeys = await request('/api/v1/settings', {
            method: 'POST',
            payload: {
                key: 'report_issue',
                value: {
                    base_url: 'https://example.com',
                    params: [
                        { key: 'a', value: '1' },
                        { key: 'a', value: '2' },
                    ],
                },
            },
        });
        expect(duplicateKeys.status).toBe(400);

        const missingParams = await request('/api/v1/settings', {
            method: 'POST',
            payload: { key: 'report_issue', value: { base_url: 'https://example.com' } },
        });
        expect(missingParams.status).toBe(400);
    });

    it('allows generic custom keys with any value', async () => {
        await login('admin');

        const createRes = await request('/api/v1/settings', {
            method: 'POST',
            payload: { key: 'custom_key', value: { foo: 'bar' } },
        });
        expect(createRes.status).toBe(201);
        expect(createRes.json.value).toMatchObject({ foo: 'bar' });
    });

    it('rejects invalid key format', async () => {
        await login('admin');

        const response = await request('/api/v1/settings', {
            method: 'POST',
            payload: { key: 'invalid key!', value: 'x' },
        });
        expect(response.status).toBe(400);
    });
});
