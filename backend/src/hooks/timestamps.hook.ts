import type { HookContext } from '../declarations.d.ts';

export const timestamps = async (context: HookContext) => {
    const now = new Date();

    if (context.method === 'create') {
        context.data.createdAt = now;
        context.data.updatedAt = now;
    }

    if (context.method === 'patch' || context.method === 'update') {
        context.data.updatedAt = now;
    }

    return context;
};
