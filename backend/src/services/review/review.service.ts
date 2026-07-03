import type { Review } from '@/types';
import type { Application } from '../../declarations.js';
import { dataSchema } from './review.schema.js';
import type { Params, ServiceInterface } from '@feathersjs/feathers';
import { getValidateHooks } from '../../utils/hooks.js';
import { utcNow } from '../../utils/dates.js';
import { type KnexAdapterTransaction } from '@feathersjs/knex';
import { transactionHandler } from '../../hooks/transaction.hook.js';

const ROUTE = '/api/v1/review';

export class ReviewService implements ServiceInterface<any, Partial<Review>> {
    private readonly app: Application;

    constructor(app: Application) {
        this.app = app;
    }

    getModel() {
        return this.app.get('db');
    }

    async create(data: Review, params: Params & { transaction: KnexAdapterTransaction }) {
        const testcase = await this.app
            .service('/api/v1/testcases')
            .get(data.testcase_id, { transaction: params.transaction });
        const pipeline = await this.app
            .service('/api/v1/pipelines')
            .get(testcase.pipeline_id, { transaction: params.transaction });

        if (data.accepted) {
            await this.app.service('/api/v1/baselines').createOrPatch(
                [
                    {
                        pipeline_name: pipeline.name,
                        group: testcase.group,
                        slug: testcase.slug,
                        name: testcase.name,
                        baseline_img: testcase.result_img,
                        created_at: utcNow(),
                        updated_at: utcNow(),
                    },
                ],
                { transaction: params.transaction },
            );
            await this.app.service('/api/v1/testcases').patch(
                testcase.id,
                {
                    status: 'passed',
                    accepted_at: utcNow(),
                    updated_at: utcNow(),
                },
                { transaction: params.transaction },
            );
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
