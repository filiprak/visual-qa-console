import type { HookContext } from "@feathersjs/feathers";

export const jsonFieldConvert = (fields: string[]) => async (context: HookContext) => {
    const convertToJson = (item: any) => {
        if (!item) return item;

        for (const field of fields) {
            if (item[field] !== undefined && item[field] !== null) {
                item[field] = JSON.stringify(item[field]);
            }
        }

        return item;
    };

    const convertFromJson = (item: any) => {
        if (!item) return item;

        for (const field of fields) {
            if (typeof item[field] === "string") {
                try {
                    item[field] = JSON.parse(item[field]);
                } catch {
                    // Keep original value if it is not valid JSON
                }
            }
        }

        return item;
    };

    // Before create/update/patch: object/array -> JSON string
    if (context.type === "before") {
        if (context.data) {
            context.data = convertToJson(context.data);
        }
    }

    // After find/get/create/update/patch: JSON string -> object/array
    if (context.type === "after") {
        if (Array.isArray(context.result?.data)) {
            context.result.data = context.result.data.map(convertFromJson);
        } else if (context.result) {
            context.result = convertFromJson(context.result);
        }
    }

    return context;
};