import { querySyntax, Type, type Static } from '@feathersjs/typebox';

const schema = Type.Object(
    {
        id: Type.Number(),
        name: Type.String(),
        email: Type.String(),
        password: Type.String(),
    },
    { additionalProperties: false },
);

export const dataSchema = Type.Pick(schema, [
    'name',
    'email',
    'password',
]);
export const patchSchema = Type.Partial(Type.Pick(schema, ['name', 'email', 'password']));
export const querySchema = querySyntax(
    Type.Pick(schema, ['id', 'name', 'email']),
    {
        name: {
            $like: Type.String(),
        },
    },
    { additionalProperties: false },
);
export const publicSchema = schema;

export type User = Static<typeof publicSchema>;
