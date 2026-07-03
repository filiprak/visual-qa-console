import { querySyntax, Type, type Static } from '@feathersjs/typebox';

const schema = Type.Object(
    {
        id: Type.Number(),
        name: Type.String(),
        pipeline_name: Type.String(),
        slug: Type.String(),
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
    'slug',
    'baseline_img',
    'updated_at',
    'created_at',
]);
export const patchSchema = Type.Partial(Type.Pick(schema, ['name']));
export const querySchema = querySyntax(Type.Pick(schema, ['name', 'pipeline_name', 'slug', 'group']));
export const publicSchema = schema;

export type Baseline = Static<typeof publicSchema>;
export type BaselinePipeline = { pipeline_name: string };
