import { Type, type Static } from '@feathersjs/typebox';

const schema = Type.Object(
    {
        id: Type.Number(),
        name: Type.String(),
        slug: Type.String(),
        group: Type.Optional(Type.String()),
        status: Type.Union([Type.Literal('passed'), Type.Literal('failed')]),
        pipeline_id: Type.Number(),
        result_img: Type.Optional(Type.String()),
        diff_img: Type.Optional(Type.String()),
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
    'slug',
    'result_img',
    'pipeline_id',
    'updated_at',
    'created_at',
]);
export const patchSchema = Type.Partial(Type.Pick(schema, ['name']));
export const querySchema = Type.Pick(schema, ['name', 'status', 'group', 'pipeline_id']);
export const publicSchema = schema;

export type TestCase = Static<typeof publicSchema>;
