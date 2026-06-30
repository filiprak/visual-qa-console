import type { Knex } from 'knex';
import type { HookContext as _HookContext } from '@feathersjs/feathers';
import type { Application as _Application } from '@feathersjs/koa';
import type { PipelinesService } from './services/pipelines/pipelines.service.js';
import type { TestCasesService } from './services/testcases/testcases.service.js';
import type { ReportService } from './services/report/report.service.js';

export interface Configuration {
    db: Knex;
}

export interface ServiceTypes {
    '/api/v1/report': ReportService;
    '/api/v1/pipelines': PipelinesService;
    '/api/v1/testcases': TestCasesService;
}

export type Application = _Application<ServiceTypes, Configuration>;
export type HookContext<S = any> = _HookContext<Application, S>;
