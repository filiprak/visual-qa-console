import { db } from './src/db.ts';

async function migrate() {
    await db.migrate.latest({
        directory: './backend/migrations',
    });

    await db.destroy();
}

migrate();
