const generateShortSha = () => Math.random().toString(16).substring(2, 9);

const getMockImg = (id: number, type: string, w: number, h: number) => `https://picsum.photos/seed/${id}-${type}/${w}/${h}`;

const sampleReport = {
    name: "website-apps",
    commit_sha: generateShortSha(),
    branch_name: "master",
    testcases: [
        {
            name: "portal.auth.desktop.login_flow",
            status: "passed",
            group: "desktop-auth",
            diff_img: getMockImg(1, "diff", 1920, 700),
            result_img: getMockImg(1, "result", 1920, 700)
        },
        {
            name: "portal.auth.desktop.forgot_password_email",
            status: "passed",
            group: "desktop-auth",
            diff_img: getMockImg(2, "diff", 1920, 700),
            result_img: getMockImg(2, "result", 1920, 700)
        },
        {
            name: "portal.auth.desktop.mfa_token_validation",
            status: "failed",
            group: "desktop-auth",
            diff_img: getMockImg(3, "diff", 1920, 700),
            result_img: getMockImg(3, "result", 1920, 700)
        },
        {
            name: "portal.auth.desktop.oauth_google_redirect",
            status: "passed",
            group: "desktop-auth",
            diff_img: getMockImg(4, "diff", 1920, 700),
            result_img: getMockImg(4, "result", 1920, 700)
        },
        {
            name: "portal.auth.desktop.session_timeout_modal",
            status: "passed",
            group: "desktop-auth",
            diff_img: getMockImg(5, "diff", 1920, 700),
            result_img: getMockImg(5, "result", 1920, 700)
        },
        {
            name: "portal.checkout.desktop.empty_cart_state",
            status: "failed",
            group: "desktop-cart",
            diff_img: getMockImg(6, "diff", 1920, 700),
            result_img: getMockImg(6, "result", 1920, 700)
        },
        {
            name: "portal.checkout.desktop.promo_code_application",
            status: "passed",
            group: "desktop-cart",
            diff_img: getMockImg(7, "diff", 1920, 700),
            result_img: getMockImg(7, "result", 1920, 700)
        },
        {
            name: "portal.checkout.desktop.shipping_address_form",
            status: "passed",
            group: "desktop-cart",
            diff_img: getMockImg(8, "diff", 1920, 700),
            result_img: getMockImg(8, "result", 1920, 700)
        },
        {
            name: "portal.checkout.desktop.credit_card_validation",
            status: "failed",
            group: "desktop-cart",
            diff_img: getMockImg(9, "diff", 1920, 700),
            result_img: getMockImg(9, "result", 1920, 700)
        },
        {
            name: "portal.checkout.desktop.order_summary_calculation",
            status: "passed",
            group: "desktop-cart",
            diff_img: getMockImg(10, "diff", 1920, 700),
            result_img: getMockImg(10, "result", 1920, 700)
        },
        {
            name: "portal.dashboard.desktop.data_table_sorting",
            status: "passed",
            group: "desktop-dashboard",
            diff_img: getMockImg(11, "diff", 1920, 700),
            result_img: getMockImg(11, "result", 1920, 700)
        },
        {
            name: "portal.dashboard.desktop.metrics_graph_render",
            status: "passed",
            group: "desktop-dashboard",
            diff_img: getMockImg(12, "diff", 1920, 700),
            result_img: getMockImg(12, "result", 1920, 700)
        },
        {
            name: "portal.dashboard.desktop.export_csv_button",
            status: "failed",
            group: "desktop-dashboard",
            diff_img: getMockImg(13, "diff", 1920, 700),
            result_img: getMockImg(13, "result", 1920, 700)
        },
        {
            name: "portal.dashboard.desktop.date_range_picker",
            status: "passed",
            group: "desktop-dashboard",
            diff_img: getMockImg(14, "diff", 1920, 700),
            result_img: getMockImg(14, "result", 1920, 700)
        },
        {
            name: "portal.dashboard.desktop.sidebar_collapse_state",
            status: "passed",
            group: "desktop-dashboard",
            diff_img: getMockImg(15, "diff", 1920, 700),
            result_img: getMockImg(15, "result", 1920, 700)
        },
        {
            name: "portal.settings.desktop.profile_avatar_upload",
            status: "failed",
            group: "desktop-settings",
            diff_img: getMockImg(16, "diff", 1920, 700),
            result_img: getMockImg(16, "result", 1920, 700)
        },
        {
            name: "portal.settings.desktop.password_change_validation",
            status: "passed",
            group: "desktop-settings",
            diff_img: getMockImg(17, "diff", 1920, 700),
            result_img: getMockImg(17, "result", 1920, 700)
        },
        {
            name: "portal.settings.desktop.billing_history_pagination",
            status: "passed",
            group: "desktop-settings",
            diff_img: getMockImg(18, "diff", 1920, 700),
            result_img: getMockImg(18, "result", 1920, 700)
        },
        {
            name: "portal.settings.desktop.email_notifications_toggle",
            status: "passed",
            group: "desktop-settings",
            diff_img: getMockImg(19, "diff", 1920, 700),
            result_img: getMockImg(19, "result", 1920, 700)
        },
        {
            name: "portal.settings.desktop.api_key_generation",
            status: "failed",
            group: "desktop-settings",
            diff_img: getMockImg(20, "diff", 1920, 700),
            result_img: getMockImg(20, "result", 1920, 700)
        },
        {
            name: "portal.navigation.mobile.hamburger_menu_toggle",
            status: "passed",
            group: "mobile-navigation",
            diff_img: getMockImg(21, "diff", 390, 700),
            result_img: getMockImg(21, "result", 390, 700)
        },
        {
            name: "portal.navigation.mobile.back_button_behavior",
            status: "passed",
            group: "mobile-navigation",
            diff_img: getMockImg(22, "diff", 390, 700),
            result_img: getMockImg(22, "result", 390, 700)
        },
        {
            name: "portal.navigation.mobile.bottom_tab_active_states",
            status: "failed",
            group: "mobile-navigation",
            diff_img: getMockImg(23, "diff", 390, 700),
            result_img: getMockImg(23, "result", 390, 700)
        },
        {
            name: "portal.navigation.mobile.deeplink_routing",
            status: "passed",
            group: "mobile-navigation",
            diff_img: getMockImg(24, "diff", 390, 700),
            result_img: getMockImg(24, "result", 390, 700)
        },
        {
            name: "portal.navigation.mobile.gestures_swipe_to_dismiss",
            status: "passed",
            group: "mobile-navigation",
            diff_img: getMockImg(25, "diff", 390, 700),
            result_img: getMockImg(25, "result", 390, 700)
        },
        {
            name: "portal.checkout.mobile.sticky_buy_button",
            status: "passed",
            group: "mobile-cart",
            diff_img: getMockImg(26, "diff", 390, 700),
            result_img: getMockImg(26, "result", 390, 700)
        },
        {
            name: "portal.checkout.mobile.apple_pay_sheet_trigger",
            status: "failed",
            group: "mobile-cart",
            diff_img: getMockImg(27, "diff", 390, 700),
            result_img: getMockImg(27, "result", 390, 700)
        },
        {
            name: "portal.checkout.mobile.item_quantity_stepper",
            status: "passed",
            group: "mobile-cart",
            diff_img: getMockImg(28, "diff", 390, 700),
            result_img: getMockImg(28, "result", 390, 700)
        },
        {
            name: "portal.checkout.mobile.swipe_to_delete_item",
            status: "passed",
            group: "mobile-cart",
            diff_img: getMockImg(29, "diff", 390, 700),
            result_img: getMockImg(29, "result", 390, 700)
        },
        {
            name: "portal.checkout.mobile.express_checkout_layout",
            status: "passed",
            group: "mobile-cart",
            diff_img: getMockImg(30, "diff", 390, 700),
            result_img: getMockImg(30, "result", 390, 700)
        },
        {
            name: "portal.search.mobile.predictive_results_dropdown",
            status: "failed",
            group: "mobile-search",
            diff_img: getMockImg(31, "diff", 390, 700),
            result_img: getMockImg(31, "result", 390, 700)
        },
        {
            name: "portal.search.mobile.recent_queries_list",
            status: "passed",
            group: "mobile-search",
            diff_img: getMockImg(32, "diff", 390, 700),
            result_img: getMockImg(32, "result", 390, 700)
        },
        {
            name: "portal.search.mobile.barcode_scanner_permissions",
            status: "passed",
            group: "mobile-search",
            diff_img: getMockImg(33, "diff", 390, 700),
            result_img: getMockImg(33, "result", 390, 700)
        },
        {
            name: "portal.search.mobile.voice_input_ui_state",
            status: "passed",
            group: "mobile-search",
            diff_img: getMockImg(34, "diff", 390, 700),
            result_img: getMockImg(34, "result", 390, 700)
        },
        {
            name: "portal.search.mobile.infinite_scroll_pagination",
            status: "failed",
            group: "mobile-search",
            diff_img: getMockImg(35, "diff", 390, 700),
            result_img: getMockImg(35, "result", 390, 700)
        },
        {
            name: "portal.notifications.mobile.toast_alert_dismiss",
            status: "passed",
            group: "mobile-notifications",
            diff_img: getMockImg(36, "diff", 390, 700),
            result_img: getMockImg(36, "result", 390, 700)
        },
        {
            name: "portal.notifications.mobile.push_payload_navigation",
            status: "passed",
            group: "mobile-notifications",
            diff_img: getMockImg(37, "diff", 390, 700),
            result_img: getMockImg(37, "result", 390, 700)
        },
        {
            name: "portal.notifications.mobile.badge_count_update",
            status: "failed",
            group: "mobile-notifications",
            diff_img: getMockImg(38, "diff", 390, 700),
            result_img: getMockImg(38, "result", 390, 700)
        },
        {
            name: "portal.notifications.mobile.in_app_inbox_empty_state",
            status: "passed",
            group: "mobile-notifications",
            diff_img: getMockImg(39, "diff", 390, 700),
            result_img: getMockImg(39, "result", 390, 700)
        },
        {
            name: "portal.notifications.mobile.preferences_sync_indicator",
            status: "passed",
            group: "mobile-notifications",
            diff_img: getMockImg(40, "diff", 390, 700),
            result_img: getMockImg(40, "result", 390, 700)
        }
    ]
};

(async () => {
    const res = await fetch('http://localhost:8080/api/v1/report', {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify(sampleReport),
    }).then(r => r.json());
    console.log(JSON.stringify(res, null, 2))
})();
