import type { Application, HookContext } from '../../declarations.js';
import { dataSchema, patchSchema, querySchema, type User } from './users.schema.js';
import { KnexService } from '@feathersjs/knex';
import { getValidateHooks } from '../../utils/hooks.js';
import { passwordHash } from '@feathersjs/authentication-local';
import { hooks, resolve } from '@feathersjs/schema';
import { jsonFieldConvert } from '../../hooks/jsonFieldConvert.js';
import { auth } from '../../hooks/auth.js';
import { errors } from '@feathersjs/errors';

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

const forbidOwnPermissionsPatch = async (context: HookContext) => {
    if (context.params.authenticated) {
        const self = context.arguments[0] === String(context.params.user.id);

        if (self && context.data.permissions) {
            throw new errors.Forbidden('Unable to change own permissions');
        }
    }
};

const forbidDeleteAdmin = async (context: HookContext<UsersService>) => {
    const deletedUserId = parseInt(context.arguments[0]);
    const user = await context.service.get(deletedUserId);
    if (user.is_admin) {
        throw new errors.Forbidden('Unable to remove admin user');
    }
};

const forbidPatchAdmin = async (context: HookContext<UsersService>) => {
    const self = context.arguments[0] === String((context.params as any).user.id);
    const patchedUserId = parseInt(context.arguments[0]);
    const user = await context.service.get(patchedUserId);
    if (!self && user.is_admin) {
        throw new errors.Forbidden('Unable to change admin user');
    }
};

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
    app.use(ROUTE, service, { methods: ['get', 'find', 'create', 'patch', 'remove'] });
    app.service(ROUTE).hooks({
        before: {
            create: [auth(['users.create'])],
            patch: [auth(['users.patch']), forbidPatchAdmin, forbidOwnPermissionsPatch],
            remove: [auth(['users.delete']), forbidDeleteAdmin],
        },
    });
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
