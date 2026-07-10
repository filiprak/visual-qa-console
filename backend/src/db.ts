import path from 'path';
import knex from 'knex';

const isTest = process.env.NODE_ENV === 'test';
const ROOT = path.resolve(import.meta.dirname, '../..');

export const DATA_DIRNAME = path.resolve(ROOT, `data`);
export const DB_FILENAME = path.resolve(DATA_DIRNAME, `db.sqlite`);

export const initDb = () => knex({
    client: 'sqlite3',
    connection: {
        filename: isTest ? ':memory:' : DB_FILENAME,
    },
    useNullAsDefault: true,
    migrations: {
        directory: './backend/migrations',
    },
});

export const db = initDb();
