import type { Application } from '../../declarations.js';
import {
    type FileRef,
    type FilesResponse,
    dataSchema
} from './files.schema.js';
import { KnexAbstract } from '../KnexAbstract.js';
import type { KnexAdapterParams } from '@feathersjs/knex';
import { getValidateHooks } from '../../utils/hooks.js';

export class FilesService extends KnexAbstract<File> {
    async create(data: FileRef[], params?: KnexAdapterParams): Promise<FilesResponse> {
        type BaselineRef = { id: number, baseline_img: string };
        type TestcaseRef = { id: number, result_img?: string, diff_img?: string };

        const ref_baselines = (
            await this.db(params)
                .select('id', 'baseline_img')
                .from('baselines')
                .whereIn('baseline_img', data.map(i => i.url)) as BaselineRef[]
        ).reduce((acc, item) => {
            acc[item.baseline_img] = item;
            return acc;
        }, {} as Record<string, BaselineRef>);

        const ref_testcaases = (
            await this.db(params)
                .select('id', 'result_img', 'diff_img')
                .from('testcases')
                .whereIn('result_img', data.map(i => i.url))
                .orWhereIn('diff_img', data.map(i => i.url)) as TestcaseRef[]
        ).reduce((acc, item) => {
            if (item.result_img)
                acc[item.result_img] = item;
            if (item.diff_img)
                acc[item.diff_img] = item;
            return acc;
        }, {} as Record<string, TestcaseRef>);

        return data.reduce((acc, item) => {
            acc[item.url] = !!ref_baselines[item.url] || !!ref_testcaases[item.url];
            return acc;
        }, {} as Record<string, boolean>);
    }
}

const ROUTE = '/api/v1/files';

export default (app: Application) => {
    const service = new FilesService({
        Model: app.get('db'),
    });
    const validateHooks = getValidateHooks({
        dataSchema: dataSchema,
    });
    app.use(ROUTE, service, { methods: ['create'] });
    app.service(ROUTE).hooks(validateHooks);
};
