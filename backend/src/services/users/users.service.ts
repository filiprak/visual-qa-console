import type { Application, HookContext } from '../../declarations.js';
import { dataSchema, patchSchema, querySchema, type User } from './users.schema.js';
import { KnexService, ERROR } from '@feathersjs/knex';
import { getValidateHooks } from '../../utils/hooks.js';
import { passwordHash } from '@feathersjs/authentication-local';
import { hooks, resolve } from '@feathersjs/schema';
import { jsonFieldConvert } from '../../hooks/jsonFieldConvert.js';

const ROUTE = '/api/v1/users';

export class UsersService extends KnexService<User> { }

export const userDataResolver = resolve<User, HookContext<UsersService>>({
    password: async (value, user, context) => {
        const doHashPassword = await passwordHash({ strategy: 'local' });
        return await doHashPassword(value, user, context as any);
    },
});

export const userExternalResolver = resolve<User, HookContext<UsersService>>({
    password: async () => undefined,
});

export default (app: Application) => {
    const service = new UsersService({
        Model: app.get('db'),
        name: 'users',
        paginate: {
            max: 300,
            default: 30,
        },
    });
    const validateHooks = getValidateHooks({
        dataSchema,
        patchSchema,
        querySchema,
    });
    app.use(ROUTE, service);
    app.service(ROUTE).hooks(validateHooks);
    app.service(ROUTE).hooks({
        before: {
            create: [hooks.resolveData(userDataResolver), jsonFieldConvert(['permissions'])],
            update: [hooks.resolveData(userDataResolver), jsonFieldConvert(['permissions'])],
            patch: [hooks.resolveData(userDataResolver), jsonFieldConvert(['permissions'])],
        },
        after: {
            all: [jsonFieldConvert(['permissions'])],
        },
        around: {
            all: [hooks.resolveExternal(userExternalResolver)],
        },
    });
};
