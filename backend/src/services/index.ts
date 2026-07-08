import type { Application } from '../declarations.js';
import report from './report/report.service.js';
import pipelines from './pipelines/pipelines.service.js';
import testcases from './testcases/testcases.service.js';
import baselines from './baselines/baselines.service.js';
import review from './review/review.service.js';
import files from './files/files.service.js';

export const appServices = (app: Application) => {
    app.configure(report);
    app.configure(pipelines);
    app.configure(testcases);
    app.configure(baselines);
    app.configure(review);
    app.configure(files);
};
