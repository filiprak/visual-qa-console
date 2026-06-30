import { Type, type Static } from '@feathersjs/typebox';

const schema = Type.Object(
    {
        name: Type.String({ minLength: 3 }),
        commit_hash: Type.String(),
        branch_name: Type.String(),
        testcases: Type.Array(
            Type.Object(
                {
                    name: Type.String({ minLength: 3 }),
                    result_img: Type.String(),
                    diff_img: Type.Optional(Type.String()),
                },
                { additionalProperties: false },
            ),
            { maxItems: 10000 },
        ),
    },
    { additionalProperties: false },
);

export const dataSchema = Type.Pick(schema, ['name', 'commit_hash', 'branch_name', 'testcases']);
export const publicSchema = schema;

export type Report = Static<typeof publicSchema>;
