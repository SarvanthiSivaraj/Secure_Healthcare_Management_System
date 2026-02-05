/**
 * Alternative Epic 4 Workflow Migration Script
 * Uses direct pg Client instead of pool to avoid authentication issues
 */

require('dotenv').config();
const { Client } = require('pg');
const fs = require('fs');
const path = require('path');

async function runMigration() {
    // Create a new client with explicit string password
    const client = new Client({
        host: process.env.DB_HOST || 'localhost',
        port: parseInt(process.env.DB_PORT) || 5432,
        database: process.env.DB_NAME || 'healthcare_db',
        user: process.env.DB_USER || 'postgres',
        password: process.env.DB_PASSWORD ? process.env.DB_PASSWORD.toString() : 'admin123',
    });

    try {
        console.log('\n🚀 Starting Epic 4 Clinical Workflow migration...\n');
        console.log(`Connecting to database: ${client.database}@${client.host}:${client.port}`);

        // Connect to database
        await client.connect();
        console.log('✅ Connected to database successfully\n');

        // Read SQL schema file
        const schemaPath = path.join(__dirname, 'schema_workflow.sql');
        const schema = fs.readFileSync(schemaPath, 'utf8');

        console.log('📄 Executing Epic 4 schema...\n');

        // Execute the schema
        await client.query(schema);

        console.log('✅ Epic 4 workflow schema created successfully!\n');
        console.log('📊 Tables created:');
        console.log('   - care_team_assignments');
        console.log('   - lab_orders');
        console.log('   - imaging_orders');
        console.log('   - medication_orders');
        console.log('   - notifications');
        console.log('   - bed_allocations');
        console.log('   - workflow_logs');
        console.log('   - one_time_tokens');
        console.log('   - visits (enhanced with state management)\n');

        console.log('🎉 Migration completed successfully!\n');

    } catch (error) {
        console.error('\n❌ Migration failed:', error.message);
        console.error('\nError details:', error);
        process.exit(1);
    } finally {
        await client.end();
    }
}

runMigration();
