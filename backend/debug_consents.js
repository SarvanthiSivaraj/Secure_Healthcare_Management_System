const { Client } = require('pg');
require('dotenv').config({ path: '../.env' });

const client = new Client({
    host: process.env.DB_HOST || 'localhost',
    port: process.env.DB_PORT || 5432,
    database: process.env.DB_NAME || 'healthcare_db',
    user: process.env.DB_USER || 'HarishGM',
    password: process.env.DB_PASSWORD || '123456',
});

async function checkData() {
    try {
        await client.connect();
        
        console.log('--- Distinct Data Categories ---');
        const categories = await client.query('SELECT DISTINCT data_category FROM consents');
        console.table(categories.rows);

        console.log('\n--- Distinct Access Levels ---');
        const levels = await client.query('SELECT DISTINCT access_level FROM consents');
        console.table(levels.rows);
        
        console.log('\n--- Sample Active Consents ---');
        const samples = await client.query(`
            SELECT id, patient_id, recipient_user_id, data_category, access_level, status 
            FROM consents 
            WHERE status = 'active' 
            LIMIT 5
        `);
        console.table(samples.rows);

    } catch (err) {
        console.error('Error:', err);
    } finally {
        await client.end();
    }
}

checkData();
