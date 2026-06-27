import { KnexService } from '@feathersjs/knex';
import type { Knex } from 'knex';

export class PipelinesService extends KnexService {
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