import type { Application } from '../../declarations.js';
import { dataSchema, patchSchema, querySchema, type TestCase } from './testcases.schema.js';
import { KnexService, type KnexAdapterParams } from '@feathersjs/knex';
import { getValidateHooks } from '../../utils/hooks.js';
import type { Static } from '@feathersjs/typebox';

type TestCaseData = Static<typeof dataSchema>;

export class TestCasesService extends KnexService<TestCase> {
    async createOrPatch(data: TestCaseData[], params?: KnexAdapterParams) {
        return this.db(params)
            .table('testcases')
            .insert(data)
            .onConflict(['pipeline_id', 'unique_key'])
            .merge(['name', 'group', 'status', 'result_img', 'diff_img', 'accepted_at', 'updated_at'])
            .returning('*');
    }
}

const ROUTE = '/api/v1/testcases';

export default (app: Application) => {
    const service = new TestCasesService({
        Model: app.get('db'),
        name: 'testcases',
        multi: true,
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
    app.use(ROUTE, service, { methods: ['find', 'get'] });
    app.service(ROUTE).hooks(validateHooks);
};
