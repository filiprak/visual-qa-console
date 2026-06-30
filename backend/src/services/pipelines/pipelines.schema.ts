import { Type, type Static } from '@feathersjs/typebox';

const schema = Type.Object(
    {
        id: Type.Number(),
        name: Type.String(),
        commit_sha: Type.String(),
        branch_name: Type.String(),
        updated_at: Type.String(),
        created_at: Type.String(),
    },
    { additionalProperties: false },
);

export const dataSchema = Type.Pick(schema, ['name', 'commit_sha', 'branch_name', 'updated_at', 'created_at']);
export const patchSchema = Type.Partial(Type.Pick(schema, []));
export const querySchema = Type.Pick(schema, ['name', 'commit_sha', 'branch_name']);
export const publicSchema = schema;

export type Pipeline = Static<typeof publicSchema>;
