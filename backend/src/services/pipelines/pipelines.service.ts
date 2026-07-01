import type { Application, HookContext } from '../../declarations.js';
import { dataSchema, patchSchema, querySchema, type Pipeline } from './pipelines.schema.js';
import { getValidateHooks } from '../../utils/hooks.js';
import { KnexService } from '@feathersjs/knex';
import { notAllowedPublic } from '../../hooks/notAllowed.hook.js';
import { hooks, resolve, virtual } from '@feathersjs/schema';

export class PipelinesService extends KnexService<Pipeline> { }

const pipelineResolver = resolve<Pipeline, HookContext<PipelinesService>>({
    details: virtual(async (pipeline, context) => {
        const result = await context.service.db(context.params).client.raw(
            `
                SELECT
                    IF(SUM(t.status = 'failed') > 0, 'failed', 'passed') AS status,
                    COUNT(DISTINCT t.\`group\`) AS total_groups,
                    SUM(t.status = 'failed') AS failed_testcases,
                    COUNT(*) AS total_testcases
                FROM pipelines p
                LEFT JOIN testcases t
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
    app.service(ROUTE).hooks(validateHooks);
    app.service(ROUTE).hooks({
        before: {
            update: [notAllowedPublic],
            create: [notAllowedPublic],
            patch: [notAllowedPublic],
            remove: [notAllowedPublic],
        },
        around: {
            find: [hooks.resolveResult(pipelineResolver)],
            get: [hooks.resolveResult(pipelineResolver)],
        },
    });
};
