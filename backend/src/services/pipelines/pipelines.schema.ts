import { querySyntax, Type, type Static } from '@feathersjs/typebox';

const schema = Type.Object(
    {
        id: Type.Number(),
        name: Type.String(),
        description: Type.Union([Type.String(), Type.Null()]),
        commit_sha: Type.String(),
        branch_name: Type.String(),
        max_shards: Type.Union([Type.Integer({ minimum: 1 }), Type.Null()]),
        details: Type.Object(
            {
                status: Type.Union([Type.Literal('passed'), Type.Literal('failed')]),
                shards: Type.Number(),
                groups: Type.Number(),
                total: Type.Number(),
                failed: Type.Number(),
                passed: Type.Number(),
                new: Type.Number(),
                reported: Type.Number(),
                approved: Type.Number(),
            },
            { additionalProperties: false },
        ),
        updated_at: Type.String(),
        created_at: Type.String(),
    },
    { additionalProperties: true },
);

export const dataSchema = Type.Pick(schema, ['name', 'description', 'commit_sha', 'branch_name', 'max_shards', 'updated_at', 'created_at']);
export const patchSchema = Type.Partial(Type.Pick(schema, ['description', 'max_shards']));
export const querySchema = querySyntax(Type.Pick(schema, ['name', 'commit_sha', 'branch_name', 'created_at']));
export const publicSchema = schema;

export type Pipeline = Static<typeof publicSchema>;
