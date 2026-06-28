import type { HookContext } from '@feathersjs/feathers';
import type { ServiceTypes } from './services/services.d.ts';
import type { Application as KoaApplication } from '@feathersjs/koa';
import type { PipelinesService } from './pipelines/pipelines.service.ts';

export interface Configuration {}

export interface ServiceTypes {
    '/api/v1/pipelines': PipelinesService;
}

export type Application = KoaApplication<ServiceTypes, Configuration>;
export type HookContext<S = any> = HookContext<Application, S>;
