import type { ApplicationHookOptions } from '@feathersjs/feathers';
import type { Application } from './declarations.d.ts';
import { knexErrors } from './hooks/knexErrors.hook.js';

export const hooks: ApplicationHookOptions<Application> = {
    error: {
        all: [knexErrors],
    },
};
