const { query, testConnection } = require('./src/config/db');
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '.env') });

async function diagnose() {
    console.log('--- Database Diagnosis ---');
    const connected = await testConnection();
    if (!connected) {
        console.error('❌ Failed to connect to database. Check your .env credentials and internet connection.');
        // Try a direct query to see the error
        try {
            const { pool } = require('./src/config/db');
            await pool.query('SELECT 1');
        } catch (e) {
            console.error('Direct pool query error:', e);
        }
        return;
    }
    console.log('✅ Connected to database');

    try {
        console.log('\n--- Checking roles table ---');
        const roles = await query('SELECT name FROM roles');
        console.log('Available roles:', roles.rows.map(r => r.name).join(', '));

        console.log('\n--- Checking staff_invitations table structure ---');
        const columns = await query(`
            SELECT column_name, data_type 
            FROM information_schema.columns 
            WHERE table_name = 'staff_invitations'
        `);
        console.log('Columns in staff_invitations:');
        columns.rows.forEach(c => console.log(`- ${c.column_name} (${c.data_type})`));

        console.log('\n--- Checking for organization_id in staff_invitations ---');
        const hasOrgId = columns.rows.some(c => c.column_name === 'organization_id');
        if (hasOrgId) {
            console.log('✅ organization_id column exists');
        } else {
            console.log('❌ organization_id column MISSING');
        }

        console.log('\n--- Checking organizations table ---');
        const orgs = await query('SELECT id, name FROM organizations LIMIT 5');
        console.log('Sample organizations:', orgs.rows);

    } catch (error) {
        console.error('❌ Error during diagnosis:', error.message);
    }
}

diagnose();
