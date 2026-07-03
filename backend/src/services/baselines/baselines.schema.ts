import { querySyntax, Type, type Static } from '@feathersjs/typebox';

const schema = Type.Object(
    {
        id: Type.Number(),
        name: Type.String(),
        pipeline_name: Type.String(),
        unique_key: Type.String(),
        group: Type.Optional(Type.String()),
        baseline_img: Type.Optional(Type.String()),
        updated_at: Type.String(),
        created_at: Type.String(),
    },
    { additionalProperties: false },
);

export const dataSchema = Type.Pick(schema, [
    'name',
    'pipeline_name',
    'group',
    'unique_key',
    'baseline_img',
    'updated_at',
    'created_at',
]);

export const matchSchema = Type.Object({
    pipeline_name: Type.String(),
    testcases: Type.Array(
        Type.Object({
            name: Type.String(),
            group: Type.String(),
        }),
        { maxItems: 10000 },
    ),
});
export const patchSchema = Type.Partial(Type.Pick(schema, ['name']));
export const querySchema = querySyntax(Type.Pick(schema, ['name', 'pipeline_name', 'unique_key', 'group']), {
    group: {
        $like: Type.String(),
    },
});
export const publicSchema = schema;

export type Baseline = Static<typeof publicSchema>;
export type BaselinePipeline = { pipeline_name: string };
export type BaselineMatch = Static<typeof matchSchema>;
export type BaselineMatchResponse = { name: string; group: string; baseline?: Baseline }[];
