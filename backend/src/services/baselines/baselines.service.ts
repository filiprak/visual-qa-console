import type { Application } from '../../declarations.js';
import {
    BaselineMatch,
    dataSchema,
    matchSchema,
    patchSchema,
    querySchema,
    type Baseline,
    type BaselineMatchResponse,
    type BaselinePipeline,
} from './baselines.schema.js';
import { KnexService, transaction, type KnexAdapterOptions, type KnexAdapterParams } from '@feathersjs/knex';
import { getValidateHooks } from '../../utils/hooks.js';
import type { Static } from '@feathersjs/typebox';
import type { Params, Query } from '@feathersjs/feathers';
import { KnexAbstract } from '../KnexAbstract.js';
import { testcaseKey } from '../../utils/func.js';
import { auth } from '../../hooks/auth.js';

type BaselineData = Static<typeof dataSchema>;

export class BaselinesService extends KnexService<Baseline> {
    async createOrPatch(data: BaselineData[], params?: KnexAdapterParams) {
        return this.db(params)
            .table('baselines')
            .insert(data)
            .onConflict(['unique_key'])
            .merge(['name', 'baseline_img', 'updated_at'])
            .returning('*');
    }
}

export class BaselinesPipelinesService extends KnexAbstract<any, Partial<BaselinePipeline>> {
    async find(params?: Params<Query> | undefined): Promise<BaselinePipeline[]> {
        return this.db(params)
            .select('pipeline_name')
            .distinct('pipeline_name')
            .from('baselines')
            .orderBy('pipeline_name');
    }
}

export class BaselinesMatchService extends KnexAbstract<any, Partial<BaselineMatch>> {
    private readonly app: Application;

    constructor(options: Omit<KnexAdapterOptions, 'name'>, app: Application) {
        super(options);
        this.app = app;
    }
    async create(data: BaselineMatch, params?: KnexAdapterParams): Promise<BaselineMatchResponse> {
        if (data.testcases.length > 0) {
            const baselines = await this.app
                .service('/api/v1/baselines')
                .find({
                    query: {
                        $limit: 1000,
                        unique_key: {
                            $in: data.testcases.map((i) => testcaseKey(data.pipeline_name, i.name, i.group)),
                        },
                    },
                    transaction: params?.transaction,
                })
                .then((r) => r.data);
            const baselines_map = new Map(baselines.map((i) => [i.unique_key, i]));
            return data.testcases.map((t) => {
                return {
                    ...t,
                    baseline: baselines_map.get(testcaseKey(data.pipeline_name, t.name, t.group)),
                };
            });
        } else {
            return [];
        }
    }
}

const ROUTE = '/api/v1/baselines';
const ROUTE_PIPELINES = '/api/v1/baselines/pipelines';
const ROUTE_MATCH = '/api/v1/baselines/match';

export default (app: Application) => {
    const service = new BaselinesService({
        Model: app.get('db'),
        name: 'baselines',
        multi: true,
        paginate: {
            max: 1000,
            default: 30,
        },
    });
    const validateHooks = getValidateHooks({
        dataSchema,
        patchSchema,
        querySchema,
    });
    app.use(ROUTE, service, { methods: ['find', 'get', 'remove'] });
    app.use(
        ROUTE_PIPELINES,
        new BaselinesPipelinesService({
            Model: app.get('db'),
        }),
    );
    app.use(
        ROUTE_MATCH,
        new BaselinesMatchService(
            {
                Model: app.get('db'),
            },
            app,
        ),
    );
    app.service(ROUTE).hooks({
        before: {
            remove: [auth(['baselines.delete'])],
        },
    });
    app.service(ROUTE).hooks(validateHooks);
    app.service(ROUTE_MATCH).hooks(
        getValidateHooks({
            dataSchema: matchSchema,
        }),
    );
};
