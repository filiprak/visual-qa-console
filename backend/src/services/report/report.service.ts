import type { Pipeline, Report } from '@/types';
import type { Application } from '../../declarations.js';
import { dataSchema } from './report.schema.js';
import type { Params, ServiceInterface } from '@feathersjs/feathers';
import { getValidateHooks } from '../../utils/hooks.js';
import { utcNow } from '../../utils/dates.js';
import { testcaseKey } from '../../utils/func.js';
import type { KnexAdapterTransaction } from '@feathersjs/knex';
import { transactionHandler } from '../../hooks/transaction.hook.js';

const ROUTE = '/api/v1/report';

export class ReportService implements ServiceInterface<any, Partial<Report>> {
    private readonly app: Application;

    constructor(app: Application) {
        this.app = app;
    }

    getModel() {
        return this.app.get('db');
    }

    async create(data: Report, params: Params & { transaction: KnexAdapterTransaction }) {
        let pipeline: Pipeline | undefined;

        const find_result = await this.app.service('/api/v1/pipelines').find({
            query: {
                name: data.name,
                commit_sha: data.commit_sha,
                branch_name: data.branch_name,
            },
            transaction: params.transaction,
        });
        if (find_result.data.length < 1) {
            pipeline = await this.app.service('/api/v1/pipelines').create(
                {
                    name: data.name,
                    commit_sha: data.commit_sha,
                    branch_name: data.branch_name,
                    created_at: utcNow(),
                    updated_at: utcNow(),
                },
                { transaction: params.transaction },
            );
        } else {
            pipeline = find_result.data[0];
            await this.app.service('/api/v1/pipelines').patch(
                pipeline.id,
                {
                    updated_at: utcNow(),
                },
                { transaction: params.transaction },
            );
        }
        if (data.testcases.length > 0) {
            await this.app.service('/api/v1/testcases').createOrPatch(
                [
                    ...data.testcases.map((i) => ({
                        ...i,
                        group: i.group || 'default',
                        unique_key: testcaseKey(pipeline.name, i.name, i.group),
                        pipeline_id: pipeline.id,
                        created_at: utcNow(),
                        updated_at: utcNow(),
                    })),
                ],
                { transaction: params.transaction },
            );
        }
        return { message: 'OK! Report received' };
    }
}

export default (app: Application) => {
    const service = new ReportService(app);
    const validateHooks = getValidateHooks({ dataSchema });

    app.use(ROUTE, service);
    app.service(ROUTE).hooks(validateHooks);
    app.service(ROUTE).hooks({
        around: {
            create: [transactionHandler],
        },
    });
};
