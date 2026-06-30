import { Type, type Static } from '@feathersjs/typebox';

const schema = Type.Object(
    {
        id: Type.Number(),
        name: Type.String(),
        slug: Type.String(),
        status: Type.Union([Type.Literal('passed'), Type.Literal('failed')]),
        pipeline_id: Type.Number(),
        updated_at: Type.String(),
        created_at: Type.String(),
    },
    { additionalProperties: false },
);

export const dataSchema = Type.Pick(schema, ['name', 'status', 'updated_at', 'created_at']);
export const patchSchema = Type.Partial(Type.Pick(schema, ['name']));
export const querySchema = Type.Pick(schema, ['name', 'pipeline_id']);
export const publicSchema = schema;

export type TestCase = Static<typeof publicSchema>;
