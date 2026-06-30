import type { Application } from '../../declarations.js';
import { dataSchema, patchSchema, querySchema, type TestCase } from './testcases.schema.js';
import { KnexService } from '@feathersjs/knex';
import { getValidateHooks } from '../../utils/hooks.js';

export class TestCasesService extends KnexService<TestCase> {}

const ROUTE = '/api/v1/testcases';

export default (app: Application) => {
    const service = new TestCasesService({
        Model: app.get('db'),
        name: 'testcases',
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
    app.service(ROUTE).hooks(validateHooks);
};
