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
            name: 'login_flow',
            status: 'passed',
            group: 'portal.apps.auth.desktop',
            diff_img: getMockImg(1, 'diff', 1920, 800),
            result_img: getMockImg(1, 'result', 2020, 700),
        },
        {
            name: 'forgot_password_email',
            status: 'passed',
            group: 'portal.apps.auth.desktop',
            diff_img: getMockImg(2, 'diff', 1920, 700),
            result_img: getMockImg(2, 'result', 1920, 900),
        },
        {
            name: 'mfa_token_validation',
            status: 'failed',
            failed_msg: 'Different screenshots',
            group: 'portal.apps.auth.desktop',
            diff_img: getMockImg(3, 'diff', 1920, 700),
            result_img: getMockImg(3, 'result', 1800, 700),
        },
        {
            name: 'oauth_google_redirect',
            status: 'passed',
            group: 'portal.apps.auth.desktop',
            diff_img: getMockImg(4, 'diff', 1920, 700),
            result_img: getMockImg(4, 'result', 1700, 600),
        },
        {
            name: 'session_timeout_modal',
            status: 'passed',
            group: 'portal.apps.auth.desktop',
            diff_img: getMockImg(5, 'diff', 1920, 700),
            result_img: getMockImg(5, 'result', 2000, 800),
        },

        {
            name: 'empty_cart_state',
            status: 'failed',
            failed_msg: 'Missing baseline screenshot',
            group: 'portal.apps.checkout.desktop',
            diff_img: getMockImg(6, 'diff', 1920, 700),
            result_img: getMockImg(6, 'result', 1920, 700),
        },
        {
            name: 'promo_code_application',
            status: 'passed',
            group: 'portal.apps.checkout.desktop',
            diff_img: getMockImg(7, 'diff', 1920, 700),
            result_img: getMockImg(7, 'result', 1920, 700),
        },
        {
            name: 'shipping_address_form',
            status: 'passed',
            group: 'portal.apps.checkout.desktop',
            diff_img: getMockImg(8, 'diff', 1920, 700),
            result_img: getMockImg(8, 'result', 1920, 700),
        },
        {
            name: 'credit_card_validation',
            status: 'failed',
            failed_msg: 'Different screenshots',
            group: 'portal.apps.checkout.desktop',
            diff_img: getMockImg(9, 'diff', 1920, 700),
            result_img: getMockImg(9, 'result', 1920, 700),
        },
        {
            name: 'order_summary_calculation',
            status: 'passed',
            group: 'portal.apps.checkout.desktop',
            diff_img: getMockImg(10, 'diff', 1920, 700),
            result_img: getMockImg(10, 'result', 1920, 700),
        },

        {
            name: 'data_table_sorting',
            status: 'passed',
            group: 'portal.apps.dashboard.desktop',
            diff_img: getMockImg(11, 'diff', 1920, 700),
            result_img: getMockImg(11, 'result', 1920, 700),
        },
        {
            name: 'metrics_graph_render',
            status: 'passed',
            group: 'portal.apps.dashboard.desktop',
            diff_img: getMockImg(12, 'diff', 1920, 700),
            result_img: getMockImg(12, 'result', 1920, 700),
        },
        {
            name: 'export_csv_button',
            status: 'failed',
            group: 'portal.apps.dashboard.desktop',
            diff_img: getMockImg(13, 'diff', 1920, 700),
            result_img: getMockImg(13, 'result', 1920, 700),
        },
        {
            name: 'date_range_picker',
            status: 'passed',
            group: 'portal.apps.dashboard.desktop',
            diff_img: getMockImg(14, 'diff', 1920, 700),
            result_img: getMockImg(14, 'result', 1920, 700),
        },
        {
            name: 'sidebar_collapse_state',
            status: 'passed',
            group: 'portal.apps.dashboard.desktop',
            diff_img: getMockImg(15, 'diff', 1920, 700),
            result_img: getMockImg(15, 'result', 1920, 700),
        },

        {
            name: 'profile_avatar_upload',
            status: 'failed',
            group: 'portal.apps.settings.desktop',
            diff_img: getMockImg(16, 'diff', 1920, 700),
            result_img: getMockImg(16, 'result', 1920, 700),
        },
        {
            name: 'password_change_validation',
            status: 'passed',
            group: 'portal.apps.settings.desktop',
            diff_img: getMockImg(17, 'diff', 1920, 700),
            result_img: getMockImg(17, 'result', 1920, 700),
        },
        {
            name: 'billing_history_pagination',
            status: 'passed',
            group: 'portal.apps.settings.desktop',
            diff_img: getMockImg(18, 'diff', 1920, 700),
            result_img: getMockImg(18, 'result', 1920, 700),
        },
        {
            name: 'email_notifications_toggle',
            status: 'passed',
            group: 'portal.apps.settings.desktop',
            diff_img: getMockImg(19, 'diff', 1920, 700),
            result_img: getMockImg(19, 'result', 1920, 700),
        },
        {
            name: 'api_key_generation',
            status: 'failed',
            group: 'portal.apps.settings.desktop',
            diff_img: getMockImg(20, 'diff', 1920, 700),
            result_img: getMockImg(20, 'result', 1920, 700),
        },

        {
            name: 'hamburger_menu_toggle',
            status: 'passed',
            group: 'portal.apps.navigation.mobile',
            diff_img: getMockImg(21, 'diff', 390, 700),
            result_img: getMockImg(21, 'result', 390, 700),
        },
        {
            name: 'back_button_behavior',
            status: 'passed',
            group: 'portal.apps.navigation.mobile',
            diff_img: getMockImg(22, 'diff', 390, 700),
            result_img: getMockImg(22, 'result', 390, 700),
        },
        {
            name: 'bottom_tab_active_states',
            status: 'failed',
            group: 'portal.apps.navigation.mobile',
            diff_img: getMockImg(23, 'diff', 390, 700),
            result_img: getMockImg(23, 'result', 390, 700),
        },
        {
            name: 'deeplink_routing',
            status: 'passed',
            group: 'portal.apps.navigation.mobile',
            diff_img: getMockImg(24, 'diff', 390, 700),
            result_img: getMockImg(24, 'result', 390, 700),
        },
        {
            name: 'gestures_swipe_to_dismiss',
            status: 'passed',
            group: 'portal.apps.navigation.mobile',
            diff_img: getMockImg(25, 'diff', 390, 700),
            result_img: getMockImg(25, 'result', 390, 700),
        },

        {
            name: 'sticky_buy_button',
            status: 'passed',
            group: 'portal.apps.checkout.mobile',
            diff_img: getMockImg(26, 'diff', 390, 700),
            result_img: getMockImg(26, 'result', 390, 700),
        },
        {
            name: 'apple_pay_sheet_trigger',
            status: 'failed',
            group: 'portal.apps.checkout.mobile',
            diff_img: getMockImg(27, 'diff', 390, 700),
            result_img: getMockImg(27, 'result', 390, 700),
        },
        {
            name: 'item_quantity_stepper',
            status: 'passed',
            group: 'portal.apps.checkout.mobile',
            diff_img: getMockImg(28, 'diff', 390, 700),
            result_img: getMockImg(28, 'result', 390, 700),
        },
        {
            name: 'swipe_to_delete_item',
            status: 'passed',
            group: 'portal.apps.checkout.mobile',
            diff_img: getMockImg(29, 'diff', 390, 700),
            result_img: getMockImg(29, 'result', 390, 700),
        },
        {
            name: 'express_checkout_layout',
            status: 'passed',
            group: 'portal.apps.checkout.mobile',
            diff_img: getMockImg(30, 'diff', 390, 700),
            result_img: getMockImg(30, 'result', 390, 700),
        },

        {
            name: 'predictive_results_dropdown',
            status: 'failed',
            group: 'portal.apps.search.mobile',
            diff_img: getMockImg(31, 'diff', 390, 700),
            result_img: getMockImg(31, 'result', 390, 700),
        },
        {
            name: 'recent_queries_list',
            status: 'passed',
            group: 'portal.apps.search.mobile',
            diff_img: getMockImg(32, 'diff', 390, 700),
            result_img: getMockImg(32, 'result', 390, 700),
        },
        {
            name: 'barcode_scanner_permissions',
            status: 'passed',
            group: 'portal.apps.search.mobile',
            diff_img: getMockImg(33, 'diff', 390, 700),
            result_img: getMockImg(33, 'result', 390, 700),
        },
        {
            name: 'voice_input_ui_state',
            status: 'passed',
            group: 'portal.apps.search.mobile',
            diff_img: getMockImg(34, 'diff', 390, 700),
            result_img: getMockImg(34, 'result', 390, 700),
        },
        {
            name: 'infinite_scroll_pagination',
            status: 'failed',
            group: 'portal.apps.search.mobile',
            diff_img: getMockImg(35, 'diff', 390, 700),
            result_img: getMockImg(35, 'result', 390, 700),
        },

        {
            name: 'toast_alert_dismiss',
            status: 'passed',
            group: 'portal.apps.notifications.mobile',
            diff_img: getMockImg(36, 'diff', 390, 700),
            result_img: getMockImg(36, 'result', 390, 700),
        },
        {
            name: 'push_payload_navigation',
            status: 'passed',
            group: 'portal.apps.notifications.mobile',
            diff_img: getMockImg(37, 'diff', 390, 700),
            result_img: getMockImg(37, 'result', 390, 700),
        },
        {
            name: 'badge_count_update',
            status: 'failed',
            group: 'portal.apps.notifications.mobile',
            diff_img: getMockImg(38, 'diff', 390, 700),
            result_img: getMockImg(38, 'result', 390, 700),
        },
        {
            name: 'in_app_inbox_empty_state',
            status: 'passed',
            group: 'portal.apps.notifications.mobile',
            diff_img: getMockImg(39, 'diff', 390, 700),
            result_img: getMockImg(39, 'result', 390, 700),
        },
        {
            name: 'preferences_sync_indicator',
            status: 'passed',
            group: 'portal.apps.notifications.mobile',
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
