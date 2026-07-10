import { authenticate } from "@feathersjs/authentication";
import type { NextFunction } from "@feathersjs/feathers";
import type { HookContext } from "../declarations.js";
import type { Permissions, User } from "../services/users/users.schema.js";
import { errors } from "@feathersjs/errors";

export const auth = (permissions: Permissions = []) => async (context: HookContext, next?: NextFunction) => {
    const ctx: HookContext = await authenticate({
        strategies: ['jwt'],
    })(context as any, next);

    const user: User = ctx.params.user;

    if (!user.is_admin) {
        const missing = permissions.find(p => {
            return !user.permissions.find(up => up === p);
        })
        if (missing) {
            throw new errors.Forbidden(`Missing required permission: ${missing}`);
        }
    }

    return ctx;
};