import type { ReportIssueValue } from '@/types';

export const REPORT_ISSUE_KEY = 'report_issue';

export const REPORT_TEMPLATE_VARS = ['GROUP', 'TEST', 'RESULT_URL', 'DIFF_URL', 'ACTUAL_URL'] as const;
export type ReportTemplateVar = (typeof REPORT_TEMPLATE_VARS)[number];

export interface ReportIssueContext {
    group?: string;
    test?: string;
    resultUrl?: string;
    diffUrl?: string;
    actualUrl?: string;
    baselineUrl?: string;
}

function toAbsoluteUrl(url: string | undefined | null): string {
    if (!url) return '';
    if (/^https?:\/\//i.test(url)) return url;
    if (url.startsWith('/') && typeof window !== 'undefined') {
        return `${window.location.origin}${url}`;
    }
    return url;
}

export function resolveTemplateVars(template: string, ctx: ReportIssueContext): string {
    if (!template) return '';
    const map: Record<string, string> = {
        GROUP: ctx.group ?? '',
        TEST: ctx.test ?? '',
        RESULT_URL: toAbsoluteUrl(ctx.resultUrl),
        DIFF_URL: toAbsoluteUrl(ctx.diffUrl),
        ACTUAL_URL: toAbsoluteUrl(ctx.actualUrl ?? ctx.resultUrl),
        BASELINE_URL: toAbsoluteUrl(ctx.baselineUrl),
    };
    return template.replace(/\{(GROUP|TEST|RESULT_URL|DIFF_URL|ACTUAL_URL|BASELINE_URL)\}/g, (match, name: string) => {
        return map[name] ?? match;
    });
}

export function buildReportIssueUrl(
    config: ReportIssueValue | null | undefined,
    ctx: ReportIssueContext,
): string | null {
    const baseUrl = config?.base_url?.trim();
    if (!baseUrl) return null;

    const params = (config?.params ?? []).filter((p) => p.key);
    const query = params
        .map((p) => `${encodeURIComponent(p.key)}=${encodeURIComponent(resolveTemplateVars(p.value ?? '', ctx))}`)
        .join('&');

    if (!query) return baseUrl;

    // Preserve existing query string on base_url if present
    const separator = baseUrl.includes('?') ? (baseUrl.endsWith('?') || baseUrl.endsWith('&') ? '' : '&') : '?';
    return `${baseUrl}${separator}${query}`;
}

export function buildDefaultReportLink(ctx: ReportIssueContext & { baselineUrl?: string }): string {
    const title = `Fix visual test ${ctx.group ?? ''}`;
    const description = [
        `### Screenshot before (expected):`,
        `![Expected](${toAbsoluteUrl(ctx.baselineUrl)})`,
        `### Screenshot after (actual result):`,
        `![Actual](${toAbsoluteUrl(ctx.resultUrl)})`,
        `### Screenshots diff:`,
        `![Diff](${toAbsoluteUrl(ctx.diffUrl)})`,
    ];
    return `https://example.com/issues/new?title=${encodeURIComponent(title)}&description=${encodeURIComponent(description.join('\n\n'))}`;
}
