import { Type, type Static } from '@feathersjs/typebox';

const schema = Type.Object(
    {
        status: Type.Union([
            Type.Literal('new'),
            Type.Literal('failed'),
            Type.Literal('passed'),
            Type.Literal('reported'),
            Type.Literal('approved'),
        ]),
        skip_baseline_update: Type.Optional(Type.Boolean()),
        testcase_ids: Type.Array(Type.Number(), { maxItems: 200 }),
    },
    { additionalProperties: false },
);

export const dataSchema = Type.Pick(schema, ['status', 'skip_baseline_update', 'testcase_ids']);
export const publicSchema = schema;

export type Review = Static<typeof publicSchema>;
