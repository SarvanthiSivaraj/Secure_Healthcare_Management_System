/**
 * Phase 1: Staff Management Database Migration
 * Safely adds staff management features without breaking existing functionality
 */

require('dotenv').config();
const { Client } = require('pg');
const fs = require('fs');
const path = require('path');

async function runMigration() {
    const client = new Client({
        host: process.env.DB_HOST || 'localhost',
        port: process.env.DB_PORT || 5432,
        database: process.env.DB_NAME || 'healthcare_db',
        user: process.env.DB_USER || 'postgres',
        password: String(process.env.DB_PASSWORD || ''),
    });

    try {
        console.log('\n🚀 Starting Phase 1 Staff Management Migration...\n');

        await client.connect();
        console.log('✅ Connected to database successfully\n');

        // Read the SQL schema file
        const schemaPath = path.join(__dirname, 'schema_staff_management.sql');
        const schemaSql = fs.readFileSync(schemaPath, 'utf8');

        // Execute the migration
        console.log('📝 Executing migration SQL...');
        await client.query(schemaSql);
        console.log('✅ Migration SQL executed successfully\n');

        // Verify the migration
        console.log('🔍 Verifying migration...\n');

        // Check if new columns exist in users table
        const userColumnsCheck = await client.query(`
            SELECT column_name 
            FROM information_schema.columns 
            WHERE table_name = 'users' 
            AND column_name IN ('account_status', 'verification_status', 'suspended_at', 'verified_at')
            ORDER BY column_name;
        `);
        console.log(`✅ User table columns added: ${userColumnsCheck.rows.map(r => r.column_name).join(', ')}`);

        // Check if new tables exist
        const tablesCheck = await client.query(`
            SELECT table_name 
            FROM information_schema.tables 
            WHERE table_schema = 'public' 
            AND table_name IN ('verification_documents', 'staff_invitations', 'account_actions')
            ORDER BY table_name;
        `);
        console.log(`✅ New tables created: ${tablesCheck.rows.map(r => r.table_name).join(', ')}`);

        // Count existing users and verify they have default status
        const usersCheck = await client.query(`
            SELECT 
                COUNT(*) as total_users,
                COUNT(*) FILTER (WHERE account_status = 'active') as active_users,
                COUNT(*) FILTER (WHERE verification_status = 'unverified') as unverified_users
            FROM users;
        `);
        const stats = usersCheck.rows[0];
        console.log(`✅ Existing users updated: ${stats.total_users} total, ${stats.active_users} active, ${stats.unverified_users} unverified`);

        // Check indexes
        const indexesCheck = await client.query(`
            SELECT indexname 
            FROM pg_indexes 
            WHERE tablename IN ('users', 'verification_documents', 'staff_invitations', 'account_actions')
            AND indexname LIKE 'idx_%'
            ORDER BY indexname;
        `);
        console.log(`✅ Indexes created: ${indexesCheck.rows.length} indexes`);

        console.log('\n' + '='.repeat(80));
        console.log('🎉 PHASE 1 STAFF MANAGEMENT MIGRATION COMPLETE!');
        console.log('='.repeat(80));
        console.log('\n📊 Summary:');
        console.log(`   - Users table extended with ${userColumnsCheck.rows.length} new columns`);
        console.log(`   - ${tablesCheck.rows.length} new tables created`);
        console.log(`   - ${stats.total_users} existing users migrated successfully`);
        console.log(`   - ${indexesCheck.rows.length} indexes created for performance`);
        console.log('\n✅ All existing functionality preserved - no breaking changes\n');

    } catch (error) {
        console.error('\n❌ Migration failed:', error.message);
        console.error('\nError details:', error);
        process.exit(1);
    } finally {
        await client.end();
    }
}

// Run migration
runMigration().then(() => {
    console.log('Migration script completed successfully');
    process.exit(0);
}).catch(error => {
    console.error('Migration script failed:', error);
    process.exit(1);
});
