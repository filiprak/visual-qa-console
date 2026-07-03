import type { Application } from '../../declarations.js';
import { BaselineMatch, dataSchema, matchSchema, patchSchema, querySchema, type Baseline, type BaselinePipeline } from './baselines.schema.js';
import { KnexService, type KnexAdapterParams } from '@feathersjs/knex';
import { getValidateHooks } from '../../utils/hooks.js';
import type { Static } from '@feathersjs/typebox';
import { notAllowedPublic } from '../../hooks/notAllowed.hook.js';
import type { Params, Query } from '@feathersjs/feathers';
import { KnexAbstract } from '../KnexAbstract.js';

type BaselineData = Static<typeof dataSchema>;

export class BaselinesService extends KnexService<Baseline> {
    async createOrPatch(data: BaselineData[], params?: KnexAdapterParams) {
        return this.db(params)
            .table('baselines')
            .insert(data)
            .onConflict(['pipeline_name', 'group', 'slug'])
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
    async create(data: BaselineMatch, params?: Params<Query> | undefined): Promise<Baseline[]> {
        return this.db(params)
            .select('*')
            .from('baselines')
            .where('pipeline_name', data.pipeline_name)
            .orderBy('pipeline_name');
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
    app.use(
        ROUTE_PIPELINES,
        new BaselinesPipelinesService({
            Model: app.get('db'),
        }),
    );
    app.use(
        ROUTE_MATCH,
        new BaselinesMatchService({
            Model: app.get('db'),
        }),
    );
    app.service(ROUTE).hooks({
        before: {
            update: [notAllowedPublic],
            create: [notAllowedPublic],
            patch: [notAllowedPublic],
        },
    });
    app.service(ROUTE).hooks(validateHooks);
    app.service(ROUTE_MATCH).hooks(
        getValidateHooks({
            dataSchema: matchSchema,
        })
    );
};
