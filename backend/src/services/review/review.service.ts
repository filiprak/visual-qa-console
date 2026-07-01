import type { Pipeline, Review } from '@/types';
import type { Application, HookContext } from '../../declarations.js';
import { dataSchema } from './review.schema.js';
import type { NextFunction, Params, Query, ServiceInterface } from '@feathersjs/feathers';
import { getValidateHooks } from '../../utils/hooks.js';
import { utcNow } from '../../utils/dates.js';
import { transaction, type KnexAdapterTransaction } from '@feathersjs/knex';

const ROUTE = '/api/v1/review';

const transactionHandler = async (context: HookContext, next: NextFunction) => {
    try {
        console.log('Start our work')
        await transaction.start()(context)
        console.log('context.params.transaction', !!context.params.transaction)
        await next()
        await transaction.end()(context)
        console.log('Work done')
    } catch (err) {
        console.log('Rollback')
        await transaction.rollback()(context)
        throw err
    }
}

export class ReviewService implements ServiceInterface<any, Partial<Review>> {
    private readonly app: Application;

    constructor(app: Application) {
        this.app = app;
    }

    getModel() {
        return this.app.get('db');
    }

    async create(data: Review, params: Params & { transaction: KnexAdapterTransaction }) {
        console.log('params.transaction', !!params.transaction)

        console.log(1)
        const testcase = await this.app.service('/api/v1/testcases').get(data.testcase_id, { transaction: params.transaction });
        console.log(2)
        const pipeline = await this.app.service('/api/v1/pipelines').get(testcase.pipeline_id, { transaction: params.transaction });

        if (data.accepted) {
            console.log(3)
            await this.app.service('/api/v1/baselines').createOrPatch([
                {
                    pipeline_name: pipeline.name,
                    group: testcase.group,
                    slug: testcase.slug,
                    name: testcase.name,
                    baseline_img: testcase.result_img,
                    created_at: utcNow(),
                    updated_at: utcNow(),
                }
            ], { transaction: params.transaction });
            console.log(4)
            throw Error('test');
            await this.app.service('/api/v1/testcases').patch(testcase.id, {
                status: 'passed',
                updated_at: utcNow(),
            }, { transaction: params.transaction });
        }

        return { message: 'OK! Review processed' };
    }
}

export default (app: Application) => {
    const service = new ReviewService(app);
    const validateHooks = getValidateHooks({ dataSchema });

    app.use(ROUTE, service);
    app.service(ROUTE).hooks(validateHooks);
    app.service(ROUTE).hooks({
        around: {
            create: [transactionHandler],
        },
    });
};
