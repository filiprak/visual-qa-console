import type { Application, HookContext } from '../../declarations.js';
import { dataSchema, patchSchema, querySchema, type Pipeline } from './pipelines.schema.js';
import { getValidateHooks } from '../../utils/hooks.js';
import { KnexService } from '@feathersjs/knex';
import { hooks, resolve, virtual } from '@feathersjs/schema';
import { auth } from '../../hooks/auth.js';

export class PipelinesService extends KnexService<Pipeline> { }

const pipelineResolver = resolve<Pipeline, HookContext<PipelinesService>>({
    details: virtual(async (pipeline, context) => {
        const result = await context.service.db(context.params).client.raw(
            `
                SELECT
                    CASE
                        WHEN SUM(t.status = 'failed') > 0 THEN 'failed'
                        ELSE 'passed'
                    END AS status,
                    COUNT(DISTINCT t.\`group\`) AS total_groups,
                    SUM(t.status = 'failed') AS failed_testcases,
                    COUNT(*) AS total_testcases
                FROM pipelines p
                INNER JOIN testcases t
                    ON t.pipeline_id = p.id
                WHERE p.id = ?
                GROUP BY p.id;
            `,
            [pipeline.id],
        );

        return {
            status: result.at(0)?.status || 'passed',
            groups: result.at(0)?.total_groups || 0,
            total: result.at(0)?.total_testcases || 0,
            passed: (result.at(0)?.total_testcases || 0) - (result.at(0)?.failed_testcases || 0),
            failed: result.at(0)?.failed_testcases || 0,
        };
    }),
});

const testcaseRemover = async (context: HookContext) => {
    if (context.arguments[0]) {
        await context.app
            .get('db')
            .table('testcases')
            .where('pipeline_id', parseInt(context.arguments[0]))
            .delete()
    }
}

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
    app.use(ROUTE, service, { methods: ['find', 'get', 'remove'] });
    app.service(ROUTE).hooks({
        before: {
            remove: [auth(['pipelines.delete'])],
        },
    });
    app.service(ROUTE).hooks(validateHooks);
    app.service(ROUTE).hooks({
        around: {
            find: [hooks.resolveResult(pipelineResolver)],
            get: [hooks.resolveResult(pipelineResolver)],
        },
        before: {
            remove: [testcaseRemover],
        },
    });
};
