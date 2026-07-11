/// <reference types="node" />
import fs from 'fs';
import path from 'path';
import { DATA_DIRNAME, db, DB_FILENAME, initDb } from './src/db.ts';
import { type Knex } from 'knex';
import knex from 'knex';
import { utcNow } from './src/utils/dates.ts';

const BACKUP_FILENAME = path.resolve(DATA_DIRNAME, `db-backup-${Date.now()}.sqlite`);

async function migrate() {
    let liveDb = db;
    let backupDb: Knex | undefined;

    if (fs.existsSync(DB_FILENAME)) {
        await liveDb.destroy();

        console.log(`Found existing db: ${DB_FILENAME}`);
        console.log(`Created backup db: ${BACKUP_FILENAME}`);

        fs.renameSync(DB_FILENAME, BACKUP_FILENAME);

        liveDb = initDb();
        backupDb = knex({
            client: 'sqlite3',
            connection: {
                filename: BACKUP_FILENAME,
            },
            useNullAsDefault: true,
        });
    }

    await liveDb.migrate.latest({
        directory: './backend/migrations',
    });

    if (backupDb) {
        // sync db data
        const BATCH_SIZE = 1000;

        try {
            console.log('🚀 Initializing data synchronization pipeline...');

            // Fetch all user table names from the source database
            const sourceTablesRaw: { name: string }[] = await backupDb.raw(
                "SELECT name FROM sqlite_master WHERE type='table' AND name NOT LIKE 'sqlite_%'"
            );
            const tablesToSync: string[] = sourceTablesRaw
                .map((t) => t.name)
                .filter((name) => !name.startsWith('knex_'));

            for (const table of tablesToSync) {
                console.log(`\n📦 Syncing data for table: [${table}]`);

                // Ensure table exists on the destination before migrating data
                const destinationTableExists: boolean = await liveDb.schema.hasTable(table);

                if (!destinationTableExists) {
                    console.warn(`⚠️ Target table "${table}" missing on destination. Run schema sync first. Skipping.`);
                    continue;
                }

                // Determine the primary tracking key (look for 'id' or default to the first column)
                const columnInfo = await backupDb(table).columnInfo();
                const sortColumn: string = Object.keys(columnInfo).includes('id')
                    ? 'id'
                    : Object.keys(columnInfo)[0];

                let offset = 0;
                let keepStreaming = true;

                while (keepStreaming) {
                    // Extract a single slice of data from source
                    const rows: Record<string, any>[] = await backupDb(table)
                        .select('*')
                        .orderBy(sortColumn, 'asc')
                        .limit(BATCH_SIZE)
                        .offset(offset);

                    if (rows.length === 0) {
                        keepStreaming = false;
                        break;
                    }

                    // Write batch cleanly inside an isolated, safe atomic transaction block
                    await liveDb.transaction(async (trx: Knex.Transaction) => {
                        // 'insert...onConflict' or clear-and-insert behavior can be chosen here.
                        // For standard syncing without overwrites, we leverage batchInsert.
                        await trx.batchInsert(table, rows, 200);
                    });

                    offset += rows.length;
                    console.log(`  ➔ Committed ${offset} records...`);
                }

                console.log(`✅ Table [${table}] synchronization complete.`);
            }

            console.log('\n🎉 Global data synchronization accomplished with zero exceptions!');
        } catch (error) {
            console.error('❌ Critical failure running data synchronization:', error);
        }
    }

    const users = (await liveDb.table('users').select('id'));

    if (users.length < 1) {
        console.log(`✅ Creating admin user.`);
        await liveDb
            .table('users')
            .insert({
                id: 1,
                name: 'admin',
                email: 'admin@example.com',
                password: '$2b$10$PyXGD6GBRzRbBgguwpZaoOqnfFsg/otHMKZamN1IjHYXuRe9mWaBa',
                is_admin: 1,
                permissions: '[]',
                updated_at: utcNow(),
                created_at: utcNow(),
            },);
    }

    await liveDb.destroy();
    await backupDb?.destroy();
}

migrate();
