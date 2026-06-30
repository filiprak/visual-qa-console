import { feathers } from '@feathersjs/feathers';
import rest from '@feathersjs/rest-client';
import type { ServiceTypes } from './services';

const app = feathers<ServiceTypes>();
const restClient = rest();

app.configure(restClient.fetch(window.fetch.bind(window)));

export const api = {
    pipelines: app.service('/api/v1/pipelines'),
    testcases: app.service('/api/v1/testcases'),
};
