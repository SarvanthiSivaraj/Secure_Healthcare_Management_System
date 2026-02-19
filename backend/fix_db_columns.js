require('dotenv').config();
const { Pool } = require('pg');

const pool = new Pool({
    user: process.env.DB_USER,
    host: process.env.DB_HOST,
    database: process.env.DB_NAME,
    password: process.env.DB_PASSWORD,
    port: process.env.DB_PORT,
});

async function fixDbColumns() {
    try {
        console.log('Connecting to DB...');

        // 1. Add closed_at column
        console.log('Adding closed_at column...');
        await pool.query(`
            ALTER TABLE visits 
            ADD COLUMN IF NOT EXISTS closed_at TIMESTAMP WITHOUT TIME ZONE;
        `);
        console.log('closed_at added.');

        // 2. Add closed_by column
        console.log('Adding closed_by column...');
        await pool.query(`
            ALTER TABLE visits 
            ADD COLUMN IF NOT EXISTS closed_by UUID;
        `);
        console.log('closed_by added.');

    } catch (err) {
        console.error('Error:', err);
    } finally {
        pool.end();
    }
}

fixDbColumns();
