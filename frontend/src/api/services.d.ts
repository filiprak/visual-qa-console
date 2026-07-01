import type { ClientService } from '@feathersjs/feathers';
import type { Pipeline, Review } from '@/types';

export interface ServiceTypes {
    '/api/v1/pipelines': ClientService<Pipeline>;
    '/api/v1/testcases': ClientService<Testcase>;
    '/api/v1/baselines': ClientService<Baseline>;
    '/api/v1/review': ClientService<Review>;
}
