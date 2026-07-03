import { querySyntax, Type, type Static } from '@feathersjs/typebox';

const schema = Type.Object(
    {
        id: Type.Number(),
        name: Type.String(),
        unique_key: Type.String(),
        group: Type.Optional(Type.String()),
        status: Type.Union([Type.Literal('passed'), Type.Literal('failed')]),
        pipeline_id: Type.Number(),
        result_img: Type.Optional(Type.String()),
        diff_img: Type.Optional(Type.String()),
        accepted_at: Type.Optional(Type.String()),
        updated_at: Type.String(),
        created_at: Type.String(),
    },
    { additionalProperties: false },
);

export const dataSchema = Type.Pick(schema, [
    'name',
    'status',
    'group',
    'diff_img',
    'unique_key',
    'result_img',
    'pipeline_id',
    'accepted_at',
    'updated_at',
    'created_at',
]);
export const patchSchema = Type.Partial(Type.Pick(schema, ['name', 'status', 'accepted_at', 'updated_at']));
export const querySchema = querySyntax(
    Type.Pick(schema, ['name', 'status', 'group', 'pipeline_id']),
    {
        group: {
            $like: Type.String(),
        },
    },
    { additionalProperties: false },
);
export const publicSchema = schema;

export type TestCase = Static<typeof publicSchema>;
