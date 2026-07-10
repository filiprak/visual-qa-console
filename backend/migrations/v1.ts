import type { Knex } from 'knex';

export async function up(knex: Knex) {

    await knex.schema.createTable('users', (table) => {
        table.increments('id');
        table.string('name');
        table.string('email').unique();
        table.string('password');
        table.boolean('is_admin').defaultTo(false);
        table.json('permissions').defaultTo([]);
        table.timestamps(true, true);
    });

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
        table.string('unique_key');
        table.integer('pipeline_id');
        table.string('group').defaultTo('default');
        table.string('status');
        table.string('failed_msg').nullable();
        table.string('result_img').nullable();
        table.string('diff_img').nullable();
        table.timestamp('accepted_at').nullable();
        table.timestamps(true, true);

        table.index(['pipeline_id']);
        table.index(['group']);
        table.index(['status']);
        table.index(['unique_key']);

        table.unique(['pipeline_id', 'unique_key']);
    });

    await knex.schema.createTable('baselines', (table) => {
        table.increments('id');
        table.string('name');
        table.string('pipeline_name');
        table.string('unique_key');
        table.string('group');
        table.string('baseline_img').nullable();
        table.timestamps(true, true);

        table.index(['pipeline_name']);
        table.index(['unique_key']);
        table.index(['group']);

        table.unique(['unique_key']);
    });
}

export async function down(knex: Knex) {
    await knex.schema.dropTable('pipelines');
    await knex.schema.dropTable('testcases');
    await knex.schema.dropTable('baselines');
    await knex.schema.dropTable('users');
}
