require('dotenv').config();
const { Pool } = require('pg');
const fs = require('fs');
const path = require('path');

const pool = new Pool({
    host: process.env.DB_HOST,
    port: parseInt(process.env.DB_PORT),
    database: process.env.DB_NAME,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
});

async function run() {
    const client = await pool.connect();
    try {
        // Check if table exists
        const check = await client.query(`SELECT EXISTS (SELECT FROM information_schema.tables WHERE table_schema='public' AND table_name='passkey_credentials')`);
        console.log('passkey_credentials table exists:', check.rows[0].exists);

        if (!check.rows[0].exists) {
            console.log('Running migration...');
            const sql = fs.readFileSync(path.join(__dirname, 'src/database/migrations/add_passkey_credentials.sql'), 'utf8');
            await client.query(sql);
            console.log('Migration completed successfully!');
        } else {
            console.log('Table already exists, skipping migration.');
        }
    } catch (err) {
        console.error('Error:', err.message);
    } finally {
        client.release();
        await pool.end();
    }
}

run();
