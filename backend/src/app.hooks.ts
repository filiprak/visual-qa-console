import type { ApplicationHookOptions } from '@feathersjs/feathers';
import type { Application } from './declarations.d.ts';
import { timestamps } from './hooks/timestamps.hook.js';

export const hooks: ApplicationHookOptions<Application> = {
    before: {
        all: [],
    },
};
