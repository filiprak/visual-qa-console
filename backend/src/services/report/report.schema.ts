import { Type, type Static } from '@feathersjs/typebox';
import { publicSchema as testcaseSchema } from '../testcases/testcases.schema.js';

const schema = Type.Object(
    {
        name: Type.String({ minLength: 3 }),
        commit_sha: Type.String(),
        branch_name: Type.String(),
        testcases: Type.Array(Type.Pick(testcaseSchema, ['name', 'status', 'group', 'diff_img', 'result_img']), {
            maxItems: 10000,
        }),
    },
    { additionalProperties: false },
);

export const dataSchema = Type.Pick(schema, ['name', 'commit_sha', 'branch_name', 'testcases']);
export const publicSchema = schema;

export type Report = Static<typeof publicSchema>;
