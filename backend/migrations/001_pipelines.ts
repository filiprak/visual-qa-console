import type { Knex } from 'knex';

export async function up(knex: Knex) {
    await knex.schema.createTable('pipelines', (table) => {
        table.increments('id');
        table.string('name');
        table.string('commit_sha');
        table.string('branch_name');
        table.timestamps(true, true);

        table.index(['commit_sha']);
        table.index(['branch_name']);
        table.index(['name', 'commit_sha', 'branch_name']);
    });
}

export async function down(knex: Knex) {
    await knex.schema.dropTable('pipelines');
}
