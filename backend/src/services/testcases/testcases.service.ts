import type { Application } from '../../declarations.js';
import { dataSchema, patchSchema, querySchema, type TestCase } from './testcases.schema.js';
import { KnexService } from '@feathersjs/knex';
import { getValidateHooks } from '../../utils/hooks.js';
import type { Static } from '@feathersjs/typebox';
import { notAllowedPublic } from '../../hooks/notAllowed.hook.js';

type TestCaseData = Static<typeof dataSchema>;

export class TestCasesService extends KnexService<TestCase> {
    async createOrPatch(data: TestCaseData[]) {
        return this.Model.table('testcases')
            .insert(data)
            .onConflict(['pipeline_id', 'group', 'slug'])
            .merge(['name', 'status', 'result_img', 'diff_img', 'updated_at'])
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
