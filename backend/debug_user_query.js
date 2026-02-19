require('dotenv').config();
const { getAllUsers } = require('./src/models/user.model');
const { Pool } = require('pg');

// Mock DB connection if needed, but user.model uses ./src/config/db which uses env vars
// So running this script with dotenv should work if db module is set up right.

async function testUserQuery() {
    try {
        console.log('Testing getAllUsers with organizationId...');

        // Test 1: System Admin case (no org id)
        console.log('\n--- Test 1: System Admin (No Org ID) ---');
        const allUsers = await getAllUsers({ limit: 5 });
        console.log(`Found ${allUsers.length} users.`);
        if (allUsers.length > 0) {
            console.log('Sample user:', allUsers[0].email);
        }

        // Test 2: Hospital Admin case (with org id)
        // First, get a valid organization_id
        const { query } = require('./src/config/db');
        const orgRes = await query('SELECT id FROM organizations LIMIT 1');
        if (orgRes.rows.length === 0) {
            console.log('No organizations found to test with.');
            return;
        }
        const orgId = orgRes.rows[0].id;
        console.log(`\n--- Test 2: Hospital Admin (Org ID: ${orgId}) ---`);

        const orgUsers = await getAllUsers({
            limit: 5,
            organizationId: orgId
        });
        console.log(`Found ${orgUsers.length} users for org ${orgId}.`);
        if (orgUsers.length > 0) {
            console.log('Sample user:', orgUsers[0].email);
        }

    } catch (err) {
        console.error('Error testing user query:', err);
    } finally {
        // We can't easily close the pool from here if it's internal to config/db, 
        // but the script will exit eventually or we can force it.
        process.exit(0);
    }
}

testUserQuery();
