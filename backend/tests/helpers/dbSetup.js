/**
 * Jest globalSetup – runs once before all integration test suites.
 * Applies all DB schema SQL files to the test database.
 */
'use strict';

const { Pool } = require('pg');
const fs = require('fs');
const path = require('path');
require('dotenv').config({ path: path.resolve(__dirname, '../../.env.test') });

const SCHEMA_FILES = [
    path.resolve(__dirname, '../../src/database/schema.sql'),
    path.resolve(__dirname, '../../src/database/schema_emr.sql'),
    path.resolve(__dirname, '../../src/database/schema_staff_management.sql'),
    path.resolve(__dirname, '../../src/database/schema_workflow.sql'),
];

module.exports = async function globalSetup() {
    const pool = new Pool({
        host: process.env.DB_HOST || 'localhost',
        port: parseInt(process.env.DB_PORT) || 5433,
        database: process.env.DB_NAME || 'healthcare_test_db',
        user: process.env.DB_USER || 'postgres',
        password: process.env.DB_PASSWORD || 'postgres',
    });

    const client = await pool.connect();
    try {
        console.log('\n🗄️  Setting up test database schema...');

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
