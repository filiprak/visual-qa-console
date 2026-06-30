import type { Application } from '../../declarations.js';
import { dataSchema, patchSchema, querySchema, type Pipeline } from './pipelines.schema.js';
import { getValidateHooks } from '../../utils/hooks.js';
import { KnexService } from '@feathersjs/knex';
import { notAllowedPublic } from '../../hooks/notAllowed.hook.js';

export class PipelinesService extends KnexService<Pipeline> {}

const ROUTE = '/api/v1/pipelines';

export default (app: Application) => {
    const service = new PipelinesService({
        Model: app.get('db'),
        name: 'pipelines',
        paginate: {
            max: 300,
            default: 30,
        },
    });
    const validateHooks = getValidateHooks({
        dataSchema,
        patchSchema,
        querySchema,
    });
    app.use(ROUTE, service);
    app.service(ROUTE).hooks({
        before: {
            update: [notAllowedPublic],
            create: [notAllowedPublic],
            patch: [notAllowedPublic],
            remove: [notAllowedPublic],
        },
    });
    app.service(ROUTE).hooks(validateHooks);
};
