#!/usr/bin/env node
// ============================================================
// Migration Orchestrator
// ============================================================
// Deterministic, ordered execution of all database migrations.
// Tracks applied migrations in a `_migrations` metadata table
// to prevent re-running and enable idempotent bootstrap.
//
// Usage:
//   node scripts/migrate-orchestrator.js                # run pending
//   node scripts/migrate-orchestrator.js --status       # show status
//   node scripts/migrate-orchestrator.js --dry-run      # preview only
//   node scripts/migrate-orchestrator.js --from-scratch # full setup (schemas + migrations)
// ============================================================

const path = require('path');
const backendNodeModules = path.resolve(__dirname, '..', 'backend', 'node_modules');

let Client;
try {
  Client = require(path.join(backendNodeModules, 'pg')).Client;
} catch (e) {
  try {
    Client = require('pg').Client;
  } catch (e2) {
    console.error('pg module not found. Run: cd backend && npm ci');
    process.exit(1);
  }
}

const fs = require('fs');
const crypto = require('crypto');

// Load .env from backend directory
const backendDir = path.resolve(__dirname, '..', 'backend');
try {
  const dotenv = require(path.join(backendDir, 'node_modules', 'dotenv'));
  const envPath = path.join(backendDir, '.env');
  if (fs.existsSync(envPath)) {
    dotenv.config({ path: envPath });
  }
} catch (e) {
  try {
    require('dotenv').config({ path: path.join(backendDir, '.env') });
  } catch (e2) {
    console.warn(' dotenv not found. Using process environment.');
  }
}

// ── Configuration ─────────────────────────────────────────

const isSupabase = process.env.DB_HOST && !process.env.DB_HOST.includes('localhost');

const dbConfig = {
  host: process.env.DB_HOST || 'localhost',
  port: parseInt(process.env.DB_PORT) || 5432,
  database: process.env.DB_NAME || 'healthcare_db',
  user: process.env.DB_USER || 'postgres',
  password: String(process.env.DB_PASSWORD || ''),
  ssl: isSupabase ? { rejectUnauthorized: false } : false,
};

// ── Migration Registry ───────────────────────────────────
// Ordered list of all migrations. Add new migrations at the bottom.

const SCHEMA_DIR = path.resolve(__dirname, '..', 'backend', 'src', 'database');
const MIGRATION_DIR = path.join(SCHEMA_DIR, 'migrations');

// Base schemas (run in order for fresh setup)
const BASE_SCHEMAS = [
  { id: '000_schema_core',            file: path.join(SCHEMA_DIR, 'schema.sql'),                   description: 'Core schema (users, patients, organizations)' },
  { id: '001_schema_emr',             file: path.join(SCHEMA_DIR, 'schema_emr.sql'),               description: 'EMR schema (diagnoses, prescriptions, labs, imaging)' },
  { id: '002_schema_staff_management', file: path.join(SCHEMA_DIR, 'schema_staff_management.sql'),  description: 'Staff management schema' },
  { id: '003_schema_workflow',         file: path.join(SCHEMA_DIR, 'schema_workflow.sql'),           description: 'Clinical workflow schema' },
];

// Incremental migrations (run after base schemas)
const MIGRATIONS = [
  { id: '010_visit_management',        file: path.join(MIGRATION_DIR, 'add_visit_management_fixed.sql'),        description: 'Visit management tables' },
  { id: '011_visit_otp_access',        file: path.join(MIGRATION_DIR, 'add_visit_otp_access_level.sql'),        description: 'Visit OTP and access level' },
  { id: '012_medical_records_immutability', file: path.join(MIGRATION_DIR, 'add_medical_records_immutability.sql'), description: 'Medical records immutability' },
  { id: '013_passkey_credentials',     file: path.join(MIGRATION_DIR, 'add_passkey_credentials.sql'),           description: 'WebAuthn/Passkey credentials' },
  { id: '014_org_invitations',         file: path.join(MIGRATION_DIR, 'add_org_to_invitations.sql'),            description: 'Organization to invitations' },
  { id: '015_visit_lifecycle',         file: path.join(MIGRATION_DIR, 'add_visit_lifecycle.sql'),               description: 'Visit lifecycle management' },
  { id: '016_fix_visit_status',        file: path.join(MIGRATION_DIR, 'fix_visit_status_constraint.sql'),       description: 'Fix visit status constraint' },
];

// ── Arguments ─────────────────────────────────────────────

const args = process.argv.slice(2);
const showStatus = args.includes('--status');
const dryRun = args.includes('--dry-run');
const fromScratch = args.includes('--from-scratch');

// ── Migration Tracking Table ──────────────────────────────

const TRACKING_TABLE_SQL = `
CREATE TABLE IF NOT EXISTS _migrations (
  id VARCHAR(100) PRIMARY KEY,
  description TEXT,
  file_hash VARCHAR(64),
  applied_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  applied_by VARCHAR(100) DEFAULT CURRENT_USER,
  execution_time_ms INTEGER
);
`;

// ── Helper Functions ──────────────────────────────────────

function fileHash(filePath) {
  const content = fs.readFileSync(filePath, 'utf8');
  return crypto.createHash('sha256').update(content).digest('hex').substring(0, 16);
}

async function ensureTrackingTable(client) {
  await client.query(TRACKING_TABLE_SQL);
}

async function getAppliedMigrations(client) {
  const result = await client.query('SELECT id, file_hash, applied_at FROM _migrations ORDER BY applied_at');
  return new Map(result.rows.map(r => [r.id, r]));
}

async function applyMigration(client, migration, dryRun = false) {
  if (!fs.existsSync(migration.file)) {
    console.error(` File not found: ${migration.file}`);
    return false;
  }

  const sql = fs.readFileSync(migration.file, 'utf8');
  const hash = fileHash(migration.file);

  if (dryRun) {
    console.log(` [DRY RUN] Would apply: ${migration.id} — ${migration.description}`);
    return true;
  }

  const start = Date.now();
  try {
    await client.query('BEGIN');
    await client.query(sql);
    await client.query(
      'INSERT INTO _migrations (id, description, file_hash, execution_time_ms) VALUES ($1, $2, $3, $4) ON CONFLICT (id) DO NOTHING',
      [migration.id, migration.description, hash, Date.now() - start]
    );
    await client.query('COMMIT');
    const elapsed = Date.now() - start;
    console.log(`  ${migration.id} — ${migration.description} (${elapsed}ms)`);
    return true;
  } catch (error) {
    await client.query('ROLLBACK');
    console.error(` ${migration.id} FAILED: ${error.message}`);
    return false;
  }
}

// ── Main ──────────────────────────────────────────────────

async function main() {
  console.log('\n Migration Orchestrator');
  console.log(`   Database: ${dbConfig.database}@${dbConfig.host}:${dbConfig.port}`);
  console.log(`   Mode: ${showStatus ? 'STATUS' : dryRun ? 'DRY RUN' : fromScratch ? 'FROM SCRATCH' : 'APPLY PENDING'}\n`);

  const client = new Client(dbConfig);

  try {
    await client.connect();
    await ensureTrackingTable(client);

    const applied = await getAppliedMigrations(client);
    const allMigrations = fromScratch ? [...BASE_SCHEMAS, ...MIGRATIONS] : MIGRATIONS;

    // ── Status mode ─────────────────────────────────────
    if (showStatus) {
      console.log('Migration Status:');
      console.log('─'.repeat(80));

      for (const m of [...BASE_SCHEMAS, ...MIGRATIONS]) {
        const record = applied.get(m.id);
        const exists = fs.existsSync(m.file);
        const status = record
          ? ` applied ${new Date(record.applied_at).toISOString().split('T')[0]}`
          : exists
            ? ' pending'
            : '  file missing';
        const hashInfo = record && exists ? (record.file_hash === fileHash(m.file) ? '' : '  MODIFIED') : '';
        console.log(`  ${status} | ${m.id} — ${m.description}${hashInfo}`);
      }

      console.log('─'.repeat(80));
      console.log(`  Total: ${BASE_SCHEMAS.length + MIGRATIONS.length} | Applied: ${applied.size} | Pending: ${BASE_SCHEMAS.length + MIGRATIONS.length - applied.size}`);
      await client.end();
      return;
    }

    // ── Apply mode ──────────────────────────────────────
    const pending = allMigrations.filter(m => !applied.has(m.id));

    if (pending.length === 0) {
      console.log(' All migrations are up to date. Nothing to apply.\n');
      await client.end();
      return;
    }

    console.log(` ${pending.length} migration(s) to apply:\n`);

    let successCount = 0;
    let failCount = 0;

    for (const migration of pending) {
      const success = await applyMigration(client, migration, dryRun);
      if (success) {
        successCount++;
      } else {
        failCount++;
        if (!dryRun) {
          console.error('\n Stopping on first failure. Fix the issue and re-run.\n');
          break;
        }
      }
    }

    console.log(`\n Results: ${successCount} applied, ${failCount} failed, ${pending.length - successCount - failCount} skipped\n`);

    if (failCount > 0) {
      process.exit(1);
    }
  } catch (error) {
    console.error(`\n Migration orchestrator failed: ${error.message}\n`);
    process.exit(1);
  } finally {
    try { await client.end(); } catch (e) { /* ignore */ }
  }
}

main();
