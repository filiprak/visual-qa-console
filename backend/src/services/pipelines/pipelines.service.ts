import type { Pipeline } from '@/types';
import type { Application } from '../../declarations.js';
import { DbServiceBase } from '../DbServiceBase.js';
import { dataSchema, patchSchema, querySchema } from './pipelines.schema.js';
import { timestamps } from '../../hooks/timestamps.hook.js';

export class PipelinesService extends DbServiceBase<Pipeline> { }

export default (app: Application) => {
    const service = new PipelinesService({
        route: '/api/v1/pipelines',
        Model: app.get('db'),
        name: 'pipelines',
        paginate: {
            max: 300,
            default: 30,
        },
        validators: {
            data: dataSchema,
            patch: patchSchema,
            query: querySchema,
        },
    });
    service.install(app, {
        before: {
            patch: [timestamps],
            update: [timestamps],
        },
    });
};
