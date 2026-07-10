import type { ClientService } from '@feathersjs/feathers';
import type { AuthenticationRequest, AuthenticationResult } from '@feathersjs/authentication';
import type { BaselineMatch, BaselineMatchResponse, BaselinePipeline, Pipeline, Review, User } from '@/types';

export interface ServiceTypes {
    '/api/v1/pipelines': ClientService<Pipeline>;
    '/api/v1/testcases': ClientService<Testcase>;
    '/api/v1/baselines': ClientService<Baseline>;
    '/api/v1/baselines/pipelines': ClientService<Baseline, never, never, BaselinePipeline[]>;
    '/api/v1/baselines/match': ClientService<BaselineMatchResponse, never, never, BaselineMatch>;
    '/api/v1/review': ClientService<Review>;
    '/api/v1/users': ClientService<User>;
    '/api/v1/auth': any;
}
