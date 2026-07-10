import type { Knex } from "knex";
import { request, setJwtToken } from "./utils.js";

export async function initialSeed(db: Knex) {
    await db
        .table('users')
        .insert({
            id: 1,
            name: 'admin',
            email: 'admin@example.com',
            password: '$2b$10$PyXGD6GBRzRbBgguwpZaoOqnfFsg/otHMKZamN1IjHYXuRe9mWaBa',
            is_admin: 1,
            updated_at: '2026-01-01 12:00:00',
            created_at: '2026-01-01 12:00:00',
        });

    const authResponse = await request('/api/v1/auth', {
        method: 'post',
        payload: {
            strategy: 'local',
            email: 'admin@example.com',
            password: 'admin'
        },
    });
    setJwtToken(authResponse.json.accessToken);
}

export async function loadSeed(
    params?: {
        pipeline_name?: string,
        commit_sha?: string,
        branch_name?: string,
        testcase_count?: number,
    }
) {
    await request('/api/v1/report', {
        method: 'post',
        payload: {
            name: params?.pipeline_name ?? 'my-pipeline',
            commit_sha: params?.commit_sha ?? 'f7d93421',
            branch_name: params?.branch_name ?? 'master',
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
                {
                    name: 'invalid password',
                    status: 'passed',
                    group: 'portal.apps.auth.signup',
                    diff_img: 'https://example.com/invalid-password.diff.png',
                    result_img: 'https://example.com/invalid-password.png',
                },
                {
                    name: 'invalid email',
                    status: 'failed',
                    group: 'portal.apps.auth.signup',
                    diff_img: 'https://example.com/invalid-email.diff.png',
                    result_img: 'https://example.com/invalid-email.png',
                },
            ].slice(0, params?.testcase_count ?? 100),
        },
    });
}