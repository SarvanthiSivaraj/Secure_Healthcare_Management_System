const { Client } = require('pg');
require('dotenv').config({ path: '../.env' });

const client = new Client({
    host: process.env.DB_HOST || 'localhost',
    port: process.env.DB_PORT || 5432,
    database: process.env.DB_NAME || 'healthcare_db',
    user: process.env.DB_USER || 'HarishGM',
    password: process.env.DB_PASSWORD || '123456',
});

async function checkMapping() {
    try {
        await client.connect();
        
        console.log('--- Users ---');
        const users = await client.query(`SELECT id, email, role_id FROM users WHERE email IN ('hosp_admin@healthcare.com', 'nurse@healthcare.com')`);
        console.table(users.rows);

        console.log('\n--- Organizations ---');
        const orgs = await client.query(`SELECT id, name FROM organizations`);
        console.table(orgs.rows);

        console.log('\n--- Mappings ---');
        const mappings = await client.query(`SELECT * FROM staff_org_mapping`);
        console.table(mappings.rows);
        
    } catch (err) {
        console.error('Error:', err);
    } finally {
        await client.end();
    }
}

checkMapping();
