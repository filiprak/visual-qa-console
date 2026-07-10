import { querySyntax, Type, type Static } from '@feathersjs/typebox';

const schema = Type.Object(
    {
        id: Type.Number(),
        name: Type.String({ minLength: 2 }),
        email: Type.String({ format: 'email' }),
        password: Type.String(),
        is_admin: Type.Boolean(),
        permissions: Type.Array(
            Type.Union([
                Type.Literal('users.create'),
                Type.Literal('users.patch'),
                Type.Literal('users.delete'),

                Type.Literal('review.create'),
                Type.Literal('pipelines.delete'),
                Type.Literal('baselines.delete'),
            ]),
        ),
    },
    { additionalProperties: false },
);

export const dataSchema = Type.Intersect([
    Type.Pick(schema, ['name', 'email', 'password']),
    Type.Partial(Type.Pick(schema, ['is_admin', 'permissions'])),
]);
export const patchSchema = Type.Partial(Type.Pick(schema, ['name', 'email', 'password', 'permissions', 'is_admin']));
export const querySchema = querySyntax(
    Type.Pick(schema, ['id', 'name', 'email', 'is_admin']),
    {
        name: {
            $like: Type.String(),
        },
    },
    { additionalProperties: false },
);
export const publicSchema = schema;

export type User = Static<typeof publicSchema>;
export type Permissions = User['permissions'];
