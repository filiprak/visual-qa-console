import type { Application, HookContext } from '../../declarations.js';
import {
    REPORT_ISSUE_KEY,
    dataSchema,
    patchSchema,
    querySchema,
    reportIssueValueSchema,
    type Setting,
} from './settings.schema.js';
import { KnexService } from '@feathersjs/knex';
import { getValidateHooks } from '../../utils/hooks.js';
import { jsonFieldConvert } from '../../hooks/jsonFieldConvert.js';
import { requireAdmin } from '../../hooks/admin.js';
import { utcNow } from '../../utils/dates.js';
import { errors } from '@feathersjs/errors';
import { dataValidator } from '../../validators.js';

const ROUTE = '/api/v1/settings';

export class SettingsService extends KnexService<Setting> {}

const setCreateTimestamps = async (context: HookContext) => {
    if (context.data) {
        const now = utcNow();
        context.data.created_at = now;
        context.data.updated_at = now;
    }
};

const setPatchTimestamps = async (context: HookContext) => {
    if (context.data) {
        context.data.updated_at = utcNow();
    }
};

const validateReportIssueValue = async (context: HookContext) => {
    const key = context.method === 'patch' || context.method === 'update'
        ? String(context.arguments[0] ?? context.id ?? '')
        : context.data?.key;

    if (key !== REPORT_ISSUE_KEY) return;

    const value = context.data?.value;
    // Allow value to be a JSON string (stored form) or object (incoming form)
    let parsed = value;
    if (typeof value === 'string') {
        try {
            parsed = JSON.parse(value);
        } catch {
            throw new errors.BadRequest('Invalid report_issue setting: value must be a valid object');
        }
    }

    const validate = (dataValidator).compile(reportIssueValueSchema);
    const valid = validate(parsed);
    if (!valid) {
        throw new errors.BadRequest(
            `Invalid report_issue setting: ${(dataValidator).errorsText?.(validate.errors) ?? 'validation failed'}`,
        );
    }

    if (parsed.base_url) {
        try {
            const url = new URL(parsed.base_url);
            if (!['http:', 'https:'].includes(url.protocol)) {
                throw new Error('unsupported protocol');
            }
        } catch {
            throw new errors.BadRequest('Invalid report_issue setting: base_url must be a valid http(s) URL');
        }
    }

    const keys = parsed.params.map((p: { key: string }) => p.key);
    if (new Set(keys).size !== keys.length) {
        throw new errors.BadRequest('Invalid report_issue setting: query parameter keys must be unique');
    }
};

export default (app: Application) => {
    const service = new SettingsService({
        Model: app.get('db'),
        name: 'settings',
        id: 'key',
        paginate: {
            max: 100,
            default: 50,
        },
    });
    const validateHooks = getValidateHooks({
        dataSchema: dataSchema,
        patchSchema: patchSchema,
        querySchema: querySchema,
    });
    app.use(ROUTE, service, { methods: ['find', 'get', 'create', 'patch', 'remove'] });
    app.service(ROUTE).hooks({
        before: {
            create: [requireAdmin],
            patch: [requireAdmin],
            update: [requireAdmin],
            remove: [requireAdmin],
        },
    });
    app.service(ROUTE).hooks(validateHooks);
    app.service(ROUTE).hooks({
        before: {
            create: [validateReportIssueValue, setCreateTimestamps, jsonFieldConvert(['value'])],
            patch: [validateReportIssueValue, setPatchTimestamps, jsonFieldConvert(['value'])],
            update: [validateReportIssueValue, setPatchTimestamps, jsonFieldConvert(['value'])],
        },
    });
    app.service(ROUTE).hooks({
        after: {
            all: [jsonFieldConvert(['value'])],
        },
    });
};
