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

    await knex.schema.createTable('testcases', (table) => {
        table.increments('id');
        table.string('name');
        table.string('slug');
        table.integer('pipeline_id');
        table.string('group').defaultTo('default');
        table.string('status');
        table.string('result_img').nullable();
        table.string('diff_img').nullable();
        table.timestamps(true, true);

        table.index(['pipeline_id']);
        table.index(['group']);
        table.index(['status']);

        table.unique(['pipeline_id', 'group', 'slug']);
    });
}

export async function down(knex: Knex) {
    await knex.schema.dropTable('pipelines');
    await knex.schema.dropTable('testcases');
}
