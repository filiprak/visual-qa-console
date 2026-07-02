import type { Application, Params, ServiceInterface } from "@feathersjs/feathers";
import type { KnexAdapterOptions, KnexAdapterParams } from "@feathersjs/knex";
import type { Knex } from "knex";

export class KnexAbstract<R, D = Partial<R>, SP = Params, PD = Partial<D>> implements ServiceInterface<R, D, SP, PD> {
    private readonly options: KnexAdapterOptions;

    constructor(options: Omit<KnexAdapterOptions, "name">) {
        this.options = { ...options, name: 'none' };

        if (!options || !options.Model) {
            throw new Error('You must provide a Model (the initialized knex object)')
        }
    }

    get Model() {
        return this.getModel()
    }

    getModel() {
        const { Model } = this.getOptions();
        return Model
    }

    getOptions() {
        return this.options;
    }

    db(params?: KnexAdapterParams) {
        const { Model, name, schema, tableOptions } = this.getOptions();

        if (params && params.transaction && params.transaction.trx) {
            const { trx } = params.transaction
            return schema ? (trx.withSchema(schema).table(name) as Knex.QueryBuilder) : trx(name)
        }

        return schema ? (Model.withSchema(schema).table(name) as Knex.QueryBuilder) : Model(name, tableOptions)
    }

    async setup(app: Application, path: string) { }
}