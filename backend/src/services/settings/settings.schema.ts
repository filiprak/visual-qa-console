import { querySyntax, Type, type Static } from '@feathersjs/typebox';

export const REPORT_ISSUE_KEY = 'report_issue';

export const reportIssueParamSchema = Type.Object(
    {
        key: Type.String({ minLength: 1, maxLength: 128 }),
        value: Type.String({ maxLength: 4096 }),
    },
    { additionalProperties: false },
);

export const reportIssueValueSchema = Type.Object(
    {
        base_url: Type.String({ maxLength: 2048 }),
        params: Type.Array(reportIssueParamSchema, { maxItems: 50 }),
    },
    { additionalProperties: false },
);

const schema = Type.Object(
    {
        key: Type.String({ minLength: 1, maxLength: 128, pattern: '^[a-zA-Z0-9_\\-\\.]+$' }),
        value: Type.Any(),
        created_at: Type.String(),
        updated_at: Type.String(),
    },
    { additionalProperties: false },
);

export const dataSchema = Type.Object(
    {
        key: Type.String({ minLength: 1, maxLength: 128, pattern: '^[a-zA-Z0-9_\\-\\.]+$' }),
        value: Type.Any(),
    },
    { additionalProperties: false },
);
export const patchSchema = Type.Object(
    {
        value: Type.Any(),
    },
    { additionalProperties: false, minProperties: 1 },
);
export const querySchema = querySyntax(
    Type.Pick(schema, ['key']),
    {},
    { additionalProperties: false },
);
export const publicSchema = schema;

export type Setting = Static<typeof publicSchema>;
export type ReportIssueParam = Static<typeof reportIssueParamSchema>;
export type ReportIssueValue = Static<typeof reportIssueValueSchema>;
