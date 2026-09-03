import { ref } from 'vue';
import { api } from '../api';
import type { ReportIssueValue } from '@/types';
import { REPORT_ISSUE_KEY, buildReportIssueUrl, type ReportIssueContext } from '../utils/reportIssue';

const cachedConfig = ref<ReportIssueValue | null | undefined>(undefined);
let inflight: Promise<ReportIssueValue | null> | null = null;

export async function fetchReportIssueConfig(force = false): Promise<ReportIssueValue | null> {
    if (!force && cachedConfig.value !== undefined) {
        return cachedConfig.value;
    }
    if (!force && inflight) {
        return inflight;
    }
    inflight = (async () => {
        try {
            const setting = await api.settings.get(REPORT_ISSUE_KEY as any);
            const value = (setting as any)?.value as ReportIssueValue | undefined;
            if (value && typeof value === 'object' && typeof (value as any).base_url === 'string') {
                cachedConfig.value = value;
                return value;
            }
            cachedConfig.value = null;
            return null;
        } catch (e: any) {
            if (e?.code === 404 || e?.status === 404 || e?.name === 'NotFound') {
                cachedConfig.value = null;
                return null;
            }
            // On auth/network errors, treat as no custom config so default link still works
            cachedConfig.value = null;
            return null;
        } finally {
            inflight = null;
        }
    })();
    return inflight;
}

export async function saveReportIssueConfig(config: ReportIssueValue): Promise<void> {
    try {
        await api.settings.patch(REPORT_ISSUE_KEY as any, { value: config } as any);
    } catch (e: any) {
        if (e?.code === 404 || e?.status === 404 || e?.name === 'NotFound') {
            await api.settings.create({ key: REPORT_ISSUE_KEY, value: config } as any);
        } else {
            throw e;
        }
    }
    cachedConfig.value = config;
}

export function useReportIssue() {
    async function getReportUrl(ctx: ReportIssueContext): Promise<string | null> {
        const config = await fetchReportIssueConfig();
        if (!config?.base_url?.trim()) return null;
        return buildReportIssueUrl(config, ctx);
    }

    return {
        cachedConfig,
        fetchReportIssueConfig,
        saveReportIssueConfig,
        getReportUrl,
    };
}
