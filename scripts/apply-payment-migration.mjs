/**
 * Apply XentriPay payment migration to remote Supabase.
 * Requires DATABASE_URL in .env (Supabase → Project Settings → Database → URI).
 *
 * Run: npm run db:migrate:payment
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import pg from 'pg';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const root = path.join(__dirname, '..');

const MIGRATIONS = [
    'supabase/migrations/20260719000000_xentripay_integration.sql',
];

function loadEnv() {
    const envPath = path.join(root, '.env');
    if (!fs.existsSync(envPath)) return;
    for (const line of fs.readFileSync(envPath, 'utf8').split('\n')) {
        const trimmed = line.trim();
        if (!trimmed || trimmed.startsWith('#')) continue;
        const idx = trimmed.indexOf('=');
        if (idx === -1) continue;
        const key = trimmed.slice(0, idx).trim();
        const val = trimmed.slice(idx + 1).trim();
        if (!process.env[key]) process.env[key] = val;
    }
}

loadEnv();

const databaseUrl = process.env.DATABASE_URL || process.env.SUPABASE_DB_URL;

if (!databaseUrl) {
    console.error(
        'Missing DATABASE_URL in .env\n' +
            'Get it from Supabase Dashboard → Project Settings → Database → Connection string (URI)\n' +
            'Example: postgresql://postgres.[ref]:[YOUR-PASSWORD]@aws-0-....pooler.supabase.com:6543/postgres',
    );
    process.exit(1);
}

const client = new pg.Client({
    connectionString: databaseUrl,
    ssl: { rejectUnauthorized: false },
});

async function ensureMigrationTable() {
    await client.query(`
        CREATE TABLE IF NOT EXISTS public.app_schema_migrations (
            filename TEXT PRIMARY KEY,
            applied_at TIMESTAMPTZ NOT NULL DEFAULT now()
        );
    `);
}

async function isApplied(filename) {
    const { rows } = await client.query(
        'SELECT 1 FROM public.app_schema_migrations WHERE filename = $1',
        [filename],
    );
    return rows.length > 0;
}

async function markApplied(filename) {
    await client.query(
        'INSERT INTO public.app_schema_migrations (filename) VALUES ($1) ON CONFLICT (filename) DO NOTHING',
        [filename],
    );
}

try {
    await client.connect();
    await ensureMigrationTable();
    console.log('Connected. Applying migrations…\n');

    let applied = 0;
    let skipped = 0;

    for (const relPath of MIGRATIONS) {
        const filename = path.basename(relPath);
        const migrationPath = path.join(root, relPath);

        if (!fs.existsSync(migrationPath)) {
            console.error(`Migration file not found: ${relPath}`);
            process.exit(1);
        }

        if (await isApplied(filename)) {
            console.log(`→ ${filename} (already applied, skip)`);
            skipped++;
            continue;
        }

        const sql = fs.readFileSync(migrationPath, 'utf8');
        console.log(`→ ${filename}`);
        await client.query(sql);
        await markApplied(filename);
        console.log(`  ✓ applied\n`);
        applied++;
    }

    console.log(`Done. ${applied} applied, ${skipped} skipped.`);
} catch (err) {
    console.error('Migration failed:', err.message);
    process.exit(1);
} finally {
    await client.end();
}
