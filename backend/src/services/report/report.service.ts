import type { Report } from '@/types';
import type { Application } from '../../declarations.js';
import { dataSchema } from './report.schema.js';
import type { Params, Query, ServiceInterface } from '@feathersjs/feathers';
import { getValidateHooks } from '../../utils/hooks.js';

const ROUTE = '/api/v1/report';

export class ReportService implements ServiceInterface<any, Partial<Report>> {

    async create(data: Report, params: Params) {
        return { ok: true };
    }

}

export default (app: Application) => {
    const service = new ReportService();
    const validateHooks = getValidateHooks({ dataSchema });

    app.use(ROUTE, service);
    app.service(ROUTE).hooks(validateHooks);
};
