import type { HookContext } from '../declarations.d.ts';

export const timestamps = async (context: HookContext) => {
    const now = new Date();

    if (!context.data) return;

    if (context.method === 'create') {
        context.data.updated_at = now;
    }

    if (context.method === 'patch' || context.method === 'update') {
        context.data.updated_at = now;
    }

    return context;
};
