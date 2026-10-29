import type { Report } from './report.schema.js';
import type { Pipeline } from '../pipelines/pipelines.schema.js';
import type { Application } from '../../declarations.js';
import { dataSchema } from './report.schema.js';
import type { Params, ServiceInterface } from '@feathersjs/feathers';
import { getValidateHooks } from '../../utils/hooks.js';
import { utcNow } from '../../utils/dates.js';
import { testcaseKey } from '../../utils/func.js';
import type { KnexAdapterTransaction } from '@feathersjs/knex';
import { errors } from '@feathersjs/errors';
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

    async findMatchedIndexes(
        pipelineName: string,
        testcases: Array<{ name: string; group: string }>,
        transaction?: KnexAdapterTransaction,
    ): Promise<Set<number>> {
        const matched = new Set<number>();
        if (testcases.length < 1) return matched;

        const BATCH_SIZE = 500;
        for (let offset = 0; offset < testcases.length; offset += BATCH_SIZE) {
            const chunk = testcases.slice(offset, offset + BATCH_SIZE);
            const result = await this.app.service('/api/v1/baselines/match').create(
                {
                    pipeline_name: pipelineName,
                    testcases: chunk,
                },
                { transaction },
            );
            chunk.forEach((_, index) => {
                if (result[index]?.baseline) {
                    matched.add(offset + index);
                }
            });
        }
        return matched;
    }

    async create(data: Report, params: Params & { transaction: KnexAdapterTransaction }) {
        let pipeline: Pipeline | undefined;

        if ((data.shard_index === undefined) !== (data.max_shards === undefined)) {
            throw new errors.BadRequest('shard_index and max_shards must be sent together');
        }
        if (data.shard_index !== undefined && data.max_shards !== undefined && data.shard_index > data.max_shards) {
            throw new errors.BadRequest('shard_index cannot be greater than max_shards');
        }

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
                    description: data.description ?? null,
                    commit_sha: data.commit_sha,
                    branch_name: data.branch_name,
                    max_shards: data.max_shards ?? null,
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
                    ...(data.description !== undefined && { description: data.description }),
                    ...(data.max_shards !== undefined && { max_shards: data.max_shards }),
                    updated_at: utcNow(),
                },
                { transaction: params.transaction },
            );
        }
        if (data.shard_index !== undefined) {
            await this.app.service('/api/v1/pipelines').addShard(
                pipeline.id,
                data.shard_index,
                { transaction: params.transaction },
            );
        }
        if (data.testcases.length > 0) {
            const prepared = data.testcases.map((i) => ({
                ...i,
                group: i.group || 'default',
                unique_key: testcaseKey(pipeline.name, i.name, i.group),
                pipeline_id: pipeline.id,
                created_at: utcNow(),
                updated_at: utcNow(),
            }));

            const matched = await this.findMatchedIndexes(
                pipeline.name,
                prepared.map((i) => ({ name: i.name, group: i.group })),
                params.transaction,
            );

            prepared.forEach((testcase, index) => {
                if (!matched.has(index)) {
                    testcase.status = 'new';
                }
            });

            await this.app.service('/api/v1/testcases').createOrPatch(
                prepared,
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
