const { Pool } = require('pg');
const fs = require('fs');
const path = require('path');
require('dotenv').config();

const pool = new Pool({
    host: process.env.DB_HOST || 'localhost',
    port: process.env.DB_PORT || 5432,
    database: process.env.DB_NAME || 'healthcare_db',
    user: process.env.DB_USER || 'postgres',
    password: process.env.DB_PASSWORD,
});

async function runEmrMigration() {
    const client = await pool.connect();

    try {
        console.log('🚀 Starting EMR database migration...\n');

        // Read the EMR schema file
        const emrSchemaPath = path.join(__dirname, 'schema_emr.sql');
        const emrSchema = fs.readFileSync(emrSchemaPath, 'utf8');

        console.log('📋 Running EMR schema (Epic 3)...');
        await client.query(emrSchema);
        console.log('✅ EMR schema completed\n');

        // Verify EMR tables were created
        const tablesQuery = `
            SELECT table_name 
            FROM information_schema.tables 
            WHERE table_schema = 'public' 
            AND table_name IN (
                'visits', 'visit_staff_assignments', 'medical_records', 
                'diagnoses', 'prescriptions', 'lab_results', 
                'imaging_reports', 'emergency_access', 'consents'
            )
            ORDER BY table_name;
        `;

        const result = await client.query(tablesQuery);
        console.log('📊 EMR tables verified:');
        result.rows.forEach(row => {
            console.log(`   ✓ ${row.table_name}`);
        });

        console.log('\n✨ EMR migration completed successfully!');

    } catch (error) {
        console.error('❌ Migration failed:', error.message);
        console.error(error.stack);
        process.exit(1);
    } finally {
        client.release();
        await pool.end();
    }
}

// Run migration
runEmrMigration();
