import { dayjs } from '../utils/dates.js';
import type { HookContext } from '../declarations.d.ts';

export const timestamps = async (context: HookContext) => {
    if (!context.data) return;

    if (context.method === 'patch' || context.method === 'update') {
        context.data.updated_at = dayjs.utc().format('YYYY-MM-DD HH:mm:ss');
    }
};
