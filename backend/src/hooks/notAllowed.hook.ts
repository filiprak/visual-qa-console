import { errors } from '@feathersjs/errors';
import type { HookContext } from '../declarations.js';

export const notAllowed = async (context: HookContext) => {
    if (context.params.provider) {
        throw new errors.MethodNotAllowed();
    }
};
