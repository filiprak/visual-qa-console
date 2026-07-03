import { hooks } from '@feathersjs/schema';
import { getValidator } from '@feathersjs/typebox';
import { querySyntax } from '@feathersjs/typebox';
import type { TObject } from '@feathersjs/typebox';
import { dataValidator, queryValidator } from '../validators.js';

interface ValidateHooksOptions {
    dataSchema?: TObject;
    patchSchema?: TObject;
    querySchema?: TObject;
}

export function getValidateHooks(options: ValidateHooksOptions) {
    const createValidator = options.dataSchema ? getValidator(options.dataSchema, dataValidator) : null;
    const patchValidator = options.patchSchema ? getValidator(options.patchSchema, dataValidator) : null;
    const queryRequestValidator = options.querySchema
        ? getValidator(options.querySchema, queryValidator)
        : null;

    return {
        before: {
            find: queryRequestValidator ? [hooks.validateQuery(queryRequestValidator)] : [],
            get: queryRequestValidator ? [hooks.validateQuery(queryRequestValidator)] : [],
            create: createValidator ? [hooks.validateData(createValidator)] : [],
            update: createValidator ? [hooks.validateData(createValidator)] : [],
            patch: patchValidator ? [hooks.validateData(patchValidator)] : [],
        },
    };
}
