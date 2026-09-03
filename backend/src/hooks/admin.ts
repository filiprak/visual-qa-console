import { authenticate } from '@feathersjs/authentication';
import type { NextFunction } from '@feathersjs/feathers';
import type { HookContext } from '../declarations.js';
import { errors } from '@feathersjs/errors';

export const requireAdmin = async (context: HookContext, next?: NextFunction) => {
    const ctx: HookContext = await authenticate({
        strategies: ['jwt'],
    })(context as any, next);

    if (!ctx.params.user?.is_admin) {
        throw new errors.Forbidden('Only administrators are allowed');
    }

    return ctx;
};
