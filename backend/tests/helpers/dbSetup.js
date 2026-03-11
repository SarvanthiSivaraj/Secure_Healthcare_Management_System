/**
 * Jest globalSetup – runs once before all integration test suites.
 *
 * 1. Connects to the "postgres" maintenance DB to CREATE the test DB if it
 *    doesn't already exist (idempotent).
 * 2. Then connects to the test DB and applies all schema SQL files.
 */
'use strict';

const { Pool, Client } = require('pg');
const fs = require('fs');
const path = require('path');
require('dotenv').config({ path: path.resolve(__dirname, '../../.env.test') });

const SCHEMA_FILES = [
    path.resolve(__dirname, '../../src/database/schema.sql'),
    path.resolve(__dirname, '../../src/database/schema_emr.sql'),
    path.resolve(__dirname, '../../src/database/schema_staff_management.sql'),
    path.resolve(__dirname, '../../src/database/schema_workflow.sql'),
];

const DB_CONFIG = {
    host: process.env.DB_HOST || 'localhost',
    port: parseInt(process.env.DB_PORT) || 5433,
    user: process.env.DB_USER || 'postgres',
    password: process.env.DB_PASSWORD || 'postgres',
};
const TEST_DB_NAME = process.env.DB_NAME || 'healthcare_test_db';

module.exports = async function globalSetup() {
    // ── Step 1: Create test DB if it doesn't exist ────────────────────────────
    // Connect to default postgres database to issue CREATE DATABASE
    const adminClient = new Client({ ...DB_CONFIG, database: 'postgres' });
    try {
        await adminClient.connect();
        const exists = await adminClient.query(
            `SELECT 1 FROM pg_database WHERE datname = $1`,
            [TEST_DB_NAME]
        );
        if (exists.rowCount === 0) {
            // Cannot use parameterised queries for CREATE DATABASE
            await adminClient.query(`CREATE DATABASE "${TEST_DB_NAME}"`);
            console.log(`\n🆕 Created test database: ${TEST_DB_NAME}`);
        } else {
            console.log(`\n✅ Test database already exists: ${TEST_DB_NAME}`);
        }
    } finally {
        await adminClient.end();
    }

    // ── Step 2: Apply schema files ────────────────────────────────────────────
    const pool = new Pool({ ...DB_CONFIG, database: TEST_DB_NAME });
    const client = await pool.connect();
    try {
        console.log('🗄️  Setting up test database schema...');

        for (const schemaFile of SCHEMA_FILES) {
            if (!fs.existsSync(schemaFile)) {
                console.warn(`⚠️  Schema file not found, skipping: ${schemaFile}`);
                continue;
            }
            const sql = fs.readFileSync(schemaFile, 'utf8');
            try {
                await client.query(sql);
                console.log(`  ✅ Applied: ${path.basename(schemaFile)}`);
            } catch (err) {
                // Ignore "already exists" errors so schema is idempotent
                if (!err.message.includes('already exists')) {
                    console.error(`  ❌ Error in ${path.basename(schemaFile)}: ${err.message}`);
                    throw err;
                }
            }
        }

        console.log('✅ Test database ready.\n');
    } finally {
        client.release();
        await pool.end();
    }
};
