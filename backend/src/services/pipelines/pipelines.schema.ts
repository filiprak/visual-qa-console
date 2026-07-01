import { Type, type Static } from '@feathersjs/typebox';

const schema = Type.Object(
    {
        id: Type.Number(),
        name: Type.String(),
        commit_sha: Type.String(),
        branch_name: Type.String(),
        details: Type.Object({
            status: Type.Union([Type.Literal('passed'), Type.Literal('failed')]),
            groups: Type.Number(),
            total: Type.Number(),
            failed: Type.Number(),
            passed: Type.Number(),
        }, { additionalProperties: false }),
        updated_at: Type.String(),
        created_at: Type.String(),
    },
    { additionalProperties: true },
);

export const dataSchema = Type.Pick(schema, ['name', 'commit_sha', 'branch_name', 'updated_at', 'created_at']);
export const patchSchema = Type.Partial(Type.Pick(schema, []));
export const querySchema = Type.Pick(schema, ['name', 'commit_sha', 'branch_name', 'created_at']);
export const publicSchema = schema;

export type Pipeline = Static<typeof publicSchema>;
