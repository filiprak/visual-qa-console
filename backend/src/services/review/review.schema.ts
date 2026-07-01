import { Type, type Static } from '@feathersjs/typebox';

const schema = Type.Object(
    {
        accepted: Type.Boolean(),
        testcase_id: Type.Number(),
    },
    { additionalProperties: false },
);

export const dataSchema = Type.Pick(schema, ['accepted', 'testcase_id']);
export const publicSchema = schema;

export type Review = Static<typeof publicSchema>;
