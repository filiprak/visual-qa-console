import { KnexService } from '@feathersjs/knex';
import type { KnexAdapterParams, KnexAdapterOptions } from '@feathersjs/knex';
import { hooks } from '@feathersjs/schema';
import { getValidator } from '@feathersjs/typebox';
import { querySyntax } from '@feathersjs/typebox';
import type { TObject } from '@feathersjs/typebox';
import { dataValidator, queryValidator } from '../validators.js';
import type { Application, ServiceTypes } from '../declarations.js';

// Define options needed for our auto-validation
export interface AutoValidatingOptions<L, D, P, Q> extends KnexAdapterOptions {
    route: keyof ServiceTypes;
    validators?: {
        data: TObject<any>; // Schema for create/update
        patch: TObject<any>; // Schema for patch
        query: TObject<any>; // Base resource schema for query syntax
    };
}

export class DbServiceBase<
    Result,
    Data = Partial<Result>,
    Params extends KnexAdapterParams = KnexAdapterParams,
    Patch = Partial<Result>,
> extends KnexService<Result, Data, Params, Patch> {
    private readonly opts: AutoValidatingOptions<Result, Data, Patch, any>;

    constructor(options: AutoValidatingOptions<Result, Data, Patch, any>) {
        super(options);
        this.opts = options;
    }

    install(app: Application) {
        const options = this.opts;

        app.use(this.opts.route, this as any);

        if (options.validators) {
            // 1. Compile validators from schemas on initialization
            const createValidator = getValidator(options.validators.data, dataValidator);
            const patchValidator = getValidator(options.validators.patch, dataValidator);

            // Automatically build allowed query syntax from the base schema
            const querySchema = querySyntax(options.validators.query);
            const serviceQueryValidator = getValidator(querySchema, queryValidator);

            app.service(this.opts.route).hooks({
                before: {
                    find: [hooks.validateQuery(serviceQueryValidator)],
                    get: [hooks.validateQuery(serviceQueryValidator)],
                    create: [hooks.validateData(createValidator)],
                    update: [hooks.validateData(createValidator)],
                    patch: [hooks.validateData(patchValidator)],
                },
            });
        }
    }
}
