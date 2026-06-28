import { Type, type Static } from '@feathersjs/typebox';

const schema = Type.Object(
    {
        id: Type.Number(),
        name: Type.String(),
        hash: Type.String(),
        updated_at: Type.String(),
        created_at: Type.String(),
    },
    { additionalProperties: false },
);

export const dataSchema = Type.Pick(schema, ['name', 'hash', 'updated_at', 'created_at']);
export const patchSchema = Type.Pick(schema, ['name', 'hash']);
export const querySchema = Type.Pick(schema, ['name', 'hash']);

export type Pipeline = Static<typeof dataSchema>;
