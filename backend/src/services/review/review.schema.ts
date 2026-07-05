import { Type, type Static } from '@feathersjs/typebox';

const schema = Type.Object(
    {
        accepted: Type.Boolean(),
        skip_baseline_update: Type.Optional(Type.Boolean()),
        testcase_ids: Type.Array(Type.Number(), { maxItems: 200 }),
    },
    { additionalProperties: false },
);

export const dataSchema = Type.Pick(schema, ['accepted', 'skip_baseline_update', 'testcase_ids']);
export const publicSchema = schema;

export type Review = Static<typeof publicSchema>;
