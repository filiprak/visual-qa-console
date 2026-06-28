import type { HookContext as _HookContext } from '@feathersjs/feathers';
import type { Application as _Application } from '@feathersjs/koa';
import type { PipelinesService } from './services/pipelines/pipelines.service.js';
import type { Knex } from 'knex';

export interface Configuration {
    db: Knex;
}

export interface ServiceTypes {
    '/api/v1/pipelines': PipelinesService;
}

export type Application = _Application<ServiceTypes, Configuration>;
export type HookContext<S = any> = _HookContext<Application, S>;
