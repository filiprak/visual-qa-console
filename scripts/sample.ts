const generateShortSha = () => Math.random().toString(16).substring(2, 9);

const getMockImg = (id: number, type: string, w: number, h: number) =>
    `https://picsum.photos/seed/${id}-${type}/${w}/${h}`;

const sampleReport = () => ({
    name: 'ui-components',
    // @ts-ignore
    commit_sha: process.argv[2] ?? generateShortSha(),
    branch_name: 'master',
    testcases: [
        {
            name: 'login flow',
            status: 'passed',
            group: 'auth desktop',
            diff_img: getMockImg(1, 'diff', 1920, 800),
            result_img: getMockImg(1, 'result', 2020, 700),
        },
        {
            name: 'forgot password email',
            status: 'passed',
            group: 'auth desktop',
            diff_img: getMockImg(2, 'diff', 1920, 700),
            result_img: getMockImg(2, 'result', 1920, 900),
        },
        {
            name: 'mfa token validation',
            status: 'failed',
            failed_msg: 'Different screenshots',
            group: 'auth desktop',
            diff_img: getMockImg(3, 'diff', 1920, 700),
            result_img: getMockImg(3, 'result', 1800, 700),
        },
        {
            name: 'oauth google redirect',
            status: 'passed',
            group: 'auth desktop',
            diff_img: getMockImg(4, 'diff', 1920, 700),
            result_img: getMockImg(4, 'result', 1700, 600),
        },
        {
            name: 'session timeout modal',
            status: 'passed',
            group: 'auth desktop',
            diff_img: getMockImg(5, 'diff', 1920, 700),
            result_img: getMockImg(5, 'result', 2000, 800),
        },

        {
            name: 'empty cart state',
            status: 'failed',
            failed_msg: 'Missing baseline screenshot',
            group: 'checkout desktop',
            diff_img: getMockImg(6, 'diff', 1920, 700),
            result_img: getMockImg(6, 'result', 1920, 700),
        },
        {
            name: 'promo code application',
            status: 'passed',
            group: 'checkout desktop',
            diff_img: getMockImg(7, 'diff', 1920, 700),
            result_img: getMockImg(7, 'result', 1920, 700),
        },
        {
            name: 'shipping address form',
            status: 'passed',
            group: 'checkout desktop',
            diff_img: getMockImg(8, 'diff', 1920, 700),
            result_img: getMockImg(8, 'result', 1920, 700),
        },
        {
            name: 'credit card validation',
            status: 'failed',
            failed_msg: 'Different screenshots',
            group: 'checkout desktop',
            diff_img: getMockImg(9, 'diff', 1920, 700),
            result_img: getMockImg(9, 'result', 1920, 700),
        },
        {
            name: 'order summary calculation',
            status: 'passed',
            group: 'checkout desktop',
            diff_img: getMockImg(10, 'diff', 1920, 700),
            result_img: getMockImg(10, 'result', 1920, 700),
        },

        {
            name: 'data table sorting',
            status: 'passed',
            group: 'dashboard desktop',
            diff_img: getMockImg(11, 'diff', 1920, 700),
            result_img: getMockImg(11, 'result', 1920, 700),
        },
        {
            name: 'metrics graph render',
            status: 'passed',
            group: 'dashboard desktop',
            diff_img: getMockImg(12, 'diff', 1920, 700),
            result_img: getMockImg(12, 'result', 1920, 700),
        },
        {
            name: 'export csv button',
            status: 'failed',
            group: 'dashboard desktop',
            diff_img: getMockImg(13, 'diff', 1920, 700),
            result_img: getMockImg(13, 'result', 1920, 700),
        },
        {
            name: 'date range picker',
            status: 'passed',
            group: 'dashboard desktop',
            diff_img: getMockImg(14, 'diff', 1920, 700),
            result_img: getMockImg(14, 'result', 1920, 700),
        },
        {
            name: 'sidebar collapse state',
            status: 'passed',
            group: 'dashboard desktop',
            diff_img: getMockImg(15, 'diff', 1920, 700),
            result_img: getMockImg(15, 'result', 1920, 700),
        },

        {
            name: 'profile avatar upload',
            status: 'failed',
            group: 'settings desktop',
            diff_img: getMockImg(16, 'diff', 1920, 700),
            result_img: getMockImg(16, 'result', 1920, 700),
        },
        {
            name: 'password change validation',
            status: 'passed',
            group: 'settings desktop',
            diff_img: getMockImg(17, 'diff', 1920, 700),
            result_img: getMockImg(17, 'result', 1920, 700),
        },
        {
            name: 'billing history pagination',
            status: 'passed',
            group: 'settings desktop',
            diff_img: getMockImg(18, 'diff', 1920, 700),
            result_img: getMockImg(18, 'result', 1920, 700),
        },
        {
            name: 'email notifications toggle',
            status: 'passed',
            group: 'settings desktop',
            diff_img: getMockImg(19, 'diff', 1920, 700),
            result_img: getMockImg(19, 'result', 1920, 700),
        },
        {
            name: 'api key generation',
            status: 'failed',
            group: 'settings desktop',
            diff_img: getMockImg(20, 'diff', 1920, 700),
            result_img: getMockImg(20, 'result', 1920, 700),
        },

        {
            name: 'hamburger menu toggle',
            status: 'passed',
            group: 'navigation mobile',
            diff_img: getMockImg(21, 'diff', 390, 700),
            result_img: getMockImg(21, 'result', 390, 700),
        },
        {
            name: 'back button behavior',
            status: 'passed',
            group: 'navigation mobile',
            diff_img: getMockImg(22, 'diff', 390, 700),
            result_img: getMockImg(22, 'result', 390, 700),
        },
        {
            name: 'bottom tab active states',
            status: 'failed',
            group: 'navigation mobile',
            diff_img: getMockImg(23, 'diff', 390, 700),
            result_img: getMockImg(23, 'result', 390, 700),
        },
        {
            name: 'deeplink routing',
            status: 'passed',
            group: 'navigation mobile',
            diff_img: getMockImg(24, 'diff', 390, 700),
            result_img: getMockImg(24, 'result', 390, 700),
        },
        {
            name: 'gestures swipe to dismiss',
            status: 'passed',
            group: 'navigation mobile',
            diff_img: getMockImg(25, 'diff', 390, 700),
            result_img: getMockImg(25, 'result', 390, 700),
        },

        {
            name: 'sticky buy button',
            status: 'passed',
            group: 'checkout mobile',
            diff_img: getMockImg(26, 'diff', 390, 700),
            result_img: getMockImg(26, 'result', 390, 700),
        },
        {
            name: 'apple pay sheet trigger',
            status: 'failed',
            group: 'checkout mobile',
            diff_img: getMockImg(27, 'diff', 390, 700),
            result_img: getMockImg(27, 'result', 390, 700),
        },
        {
            name: 'item quantity stepper',
            status: 'passed',
            group: 'checkout mobile',
            diff_img: getMockImg(28, 'diff', 390, 700),
            result_img: getMockImg(28, 'result', 390, 700),
        },
        {
            name: 'swipe to delete item',
            status: 'passed',
            group: 'checkout mobile',
            diff_img: getMockImg(29, 'diff', 390, 700),
            result_img: getMockImg(29, 'result', 390, 700),
        },
        {
            name: 'express checkout layout',
            status: 'passed',
            group: 'checkout mobile',
            diff_img: getMockImg(30, 'diff', 390, 700),
            result_img: getMockImg(30, 'result', 390, 700),
        },

        {
            name: 'predictive results dropdown',
            status: 'failed',
            group: 'search mobile',
            diff_img: getMockImg(31, 'diff', 390, 700),
            result_img: getMockImg(31, 'result', 390, 700),
        },
        {
            name: 'recent queries list',
            status: 'passed',
            group: 'search mobile',
            diff_img: getMockImg(32, 'diff', 390, 700),
            result_img: getMockImg(32, 'result', 390, 700),
        },
        {
            name: 'barcode scanner permissions',
            status: 'passed',
            group: 'search mobile',
            diff_img: getMockImg(33, 'diff', 390, 700),
            result_img: getMockImg(33, 'result', 390, 700),
        },
        {
            name: 'voice input ui state',
            status: 'passed',
            group: 'search mobile',
            diff_img: getMockImg(34, 'diff', 390, 700),
            result_img: getMockImg(34, 'result', 390, 700),
        },
        {
            name: 'infinite scroll pagination',
            status: 'failed',
            group: 'search mobile',
            diff_img: getMockImg(35, 'diff', 390, 700),
            result_img: getMockImg(35, 'result', 390, 700),
        },

        {
            name: 'toast alert dismiss',
            status: 'passed',
            group: 'notifications mobile',
            diff_img: getMockImg(36, 'diff', 390, 700),
            result_img: getMockImg(36, 'result', 390, 700),
        },
        {
            name: 'push payload navigation',
            status: 'passed',
            group: 'notifications mobile',
            diff_img: getMockImg(37, 'diff', 390, 700),
            result_img: getMockImg(37, 'result', 390, 700),
        },
        {
            name: 'badge count update',
            status: 'failed',
            group: 'notifications mobile',
            diff_img: getMockImg(38, 'diff', 390, 700),
            result_img: getMockImg(38, 'result', 390, 700),
        },
        {
            name: 'in app inbox empty state',
            status: 'passed',
            group: 'notifications mobile',
            diff_img: getMockImg(39, 'diff', 390, 700),
            result_img: getMockImg(39, 'result', 390, 700),
        },
        {
            name: 'preferences sync indicator',
            status: 'passed',
            group: 'notifications mobile',
            diff_img: getMockImg(40, 'diff', 390, 700),
            result_img: getMockImg(40, 'result', 390, 700),
        },
    ],
});

async function report() {
    const res = await fetch('http://localhost:8080/api/v1/report', {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify(sampleReport()),
    }).then((r) => r.json());
    console.log(JSON.stringify(res, null, 2));
}

(async () => {
    await Promise.all([report()]);
})();
