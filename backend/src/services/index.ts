import type { Application } from '../declarations.js';
import pipelines from './pipelines/pipelines.service.js';

export const appServices = (app: Application) => {
    app.configure(pipelines);
};
