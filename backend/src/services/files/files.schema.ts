import { Type, type Static } from '@feathersjs/typebox';

const schema = Type.Object(
    {
        url: Type.String(),
    },
    { additionalProperties: false },
);

export const dataSchema = schema;

export type FileRef = Static<typeof dataSchema>;
export type FilesResponse = Record<string, boolean>;
