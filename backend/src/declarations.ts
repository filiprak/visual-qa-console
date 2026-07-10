import type { Knex } from 'knex';
import type { HookContext as _HookContext } from '@feathersjs/feathers';
import type { AuthenticationConfiguration, AuthenticationService } from '@feathersjs/authentication';
import type { Application as _Application } from '@feathersjs/koa';
import type { PipelinesService } from './services/pipelines/pipelines.service.js';
import type { TestCasesService } from './services/testcases/testcases.service.js';
import type { ReportService } from './services/report/report.service.js';
import type {
    BaselinesMatchService,
    BaselinesPipelinesService,
    BaselinesService,
} from './services/baselines/baselines.service.js';
import type { ReviewService } from './services/review/review.service.js';
import type { FilesService } from './services/files/files.service.js';
import type { UsersService } from './services/users/users.service.js';

export interface Configuration {
    db: Knex;
    authentication: AuthenticationConfiguration,
}

export interface ServiceTypes {
    '/api/v1/auth': AuthenticationService;
    '/api/v1/users': UsersService;
    '/api/v1/report': ReportService;
    '/api/v1/pipelines': PipelinesService;
    '/api/v1/testcases': TestCasesService;
    '/api/v1/baselines': BaselinesService;
    '/api/v1/baselines/pipelines': BaselinesPipelinesService;
    '/api/v1/baselines/match': BaselinesMatchService;
    '/api/v1/review': ReviewService;
    '/api/v1/files': FilesService;
}

export type Application = _Application<ServiceTypes, Configuration>;
export type HookContext<S = any> = _HookContext<Application, S>;
