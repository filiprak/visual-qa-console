import type { NextFunction } from '@feathersjs/feathers';
import type { HookContext } from '../declarations.js';
import { transaction } from '@feathersjs/knex';

export const transactionHandler = async (context: HookContext, next: NextFunction) => {
    try {
        await transaction.start()(context);
        await next();
        await transaction.end()(context);
    } catch (err) {
        await transaction.rollback()(context);
        throw err;
    }
};
