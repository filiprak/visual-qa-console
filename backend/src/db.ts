import knex from 'knex';

const isTest = process.env.NODE_ENV === 'test';

export const db = knex({
    client: 'sqlite3',
    connection: {
        filename: isTest ? ':memory:' : `./data/db.sqlite`,
    },
    useNullAsDefault: true,
    migrations: {
        directory: './backend/migrations',
    },
});
