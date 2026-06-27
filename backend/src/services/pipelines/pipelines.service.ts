import { KnexService } from '@feathersjs/knex';
import type { Pipeline } from '@/types';
import type { Knex } from 'knex';

export class PipelinesService extends KnexService<Pipeline> {
    static factory(db: Knex) {
        return new PipelinesService({
            Model: db,
            name: 'pipelines',
            paginate: {
                max: 300,
                default: 30,
            },
        });
    }
}
