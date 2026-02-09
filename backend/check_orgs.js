const { Client } = require('pg');
require('dotenv').config({ path: '../.env' });

const client = new Client({
    host: process.env.DB_HOST || 'localhost',
    port: process.env.DB_PORT || 5432,
    database: process.env.DB_NAME || 'healthcare_db',
    user: process.env.DB_USER || 'HarishGM',
    password: process.env.DB_PASSWORD || '123456',
});

async function checkOrgs() {
    try {
        await client.connect();
        
        const query = `SELECT * FROM organizations`;
        const res = await client.query(query);
        
        if (res.rows.length === 0) {
            console.log('No organizations found.');
        } else {
            console.table(res.rows);
        }
        
    } catch (err) {
        console.error('Error:', err);
    } finally {
        await client.end();
    }
}

checkOrgs();
