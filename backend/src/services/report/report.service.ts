import type { Pipeline, Report } from '@/types';
import type { Application } from '../../declarations.js';
import { dataSchema } from './report.schema.js';
import type { Params, Query, ServiceInterface } from '@feathersjs/feathers';
import { getValidateHooks } from '../../utils/hooks.js';
import { utcNow } from '../../utils/dates.js';
import { slugify } from '../../utils/func.js';

const ROUTE = '/api/v1/report';

export class ReportService implements ServiceInterface<any, Partial<Report>> {
    private readonly app: Application;

    constructor(app: Application) {
        this.app = app;
    }

    async create(data: Report, params: Params) {
        let pipeline: Pipeline | undefined;

        const find_result = await this.app.service('/api/v1/pipelines').find({
            query: {
                name: data.name,
                commit_sha: data.commit_sha,
                branch_name: data.branch_name,
            },
        });
        if (find_result.data.length < 1) {
            pipeline = await this.app.service('/api/v1/pipelines').create({
                name: data.name,
                commit_sha: data.commit_sha,
                branch_name: data.branch_name,
                created_at: utcNow(),
                updated_at: utcNow(),
            });
        } else {
            pipeline = find_result.data[0];
        }
        if (data.testcases.length > 0) {
            await this.app.service('/api/v1/testcases').createOrPatch([
                ...data.testcases.map((i) => ({
                    ...i,
                    slug: slugify(i.name),
                    pipeline_id: pipeline.id,
                    created_at: utcNow(),
                    updated_at: utcNow(),
                })),
            ]);
        }
        return { message: 'OK! Report received' };
    }
}

export default (app: Application) => {
    const service = new ReportService(app);
    const validateHooks = getValidateHooks({ dataSchema });

    app.use(ROUTE, service);
    app.service(ROUTE).hooks(validateHooks);
};
