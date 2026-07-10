import { ERROR } from '@feathersjs/knex';
import { errors } from '@feathersjs/errors';
import type { HookContext } from '../declarations.d.ts';

export const knexErrors = async (context: HookContext) => {
    const knexError = context.error?.[ERROR];

    if (knexError) {
        const knexCode = knexError.code;

        if (knexCode == 'SQLITE_CONSTRAINT') {
            context.error = new errors.BadRequest(`Data constraints failed`);
        } else {
            let msg: string = `Database error: ${knexCode}`;

            if (process.env.NODE_ENV == 'development') {
                msg += `: ${knexError}`;
            }

            context.error = new errors.GeneralError(msg);
        }
    }
};
