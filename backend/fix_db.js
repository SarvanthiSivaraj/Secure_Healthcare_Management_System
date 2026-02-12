require('dotenv').config();
const { Pool } = require('pg');

const pool = new Pool({
    user: process.env.DB_USER,
    host: process.env.DB_HOST,
    database: process.env.DB_NAME,
    password: process.env.DB_PASSWORD,
    port: process.env.DB_PORT,
});

async function fixDb() {
    try {
        console.log('Connecting to DB...');

        // 1. Add visit_code column if it doesn't exist
        console.log('Adding visit_code column...');
        await pool.query(`
            ALTER TABLE visits 
            ADD COLUMN IF NOT EXISTS visit_code VARCHAR(255);
        `);
        console.log('Column added.');

        // 2. Backfill visit_code from otp_code if visit_code is NULL
        console.log('Backfilling visit_code from otp_code...');
        await pool.query(`
            UPDATE visits 
            SET visit_code = otp_code 
            WHERE visit_code IS NULL AND otp_code IS NOT NULL;
        `);
        console.log('Backfill complete.');

        // 3. Verify
        const res = await pool.query('SELECT visit_code, otp_code FROM visits LIMIT 5');
        console.log('Sample Data:', res.rows);

    } catch (err) {
        console.error('Error:', err);
    } finally {
        pool.end();
    }
}

fixDb();
