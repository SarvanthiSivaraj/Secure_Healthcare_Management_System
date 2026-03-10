require('dotenv').config();
const { Pool } = require('pg');

const isSupabase = process.env.DB_HOST && !process.env.DB_HOST.includes('localhost');
const pool = new Pool({
    host: process.env.DB_HOST,
    port: process.env.DB_PORT,
    database: process.env.DB_NAME,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    ssl: isSupabase ? { rejectUnauthorized: false } : false,
});

async function cleanJohn() {
    try {
        console.log("Cleaning John Doe visits...");
        const res = await pool.query("DELETE FROM visits WHERE patient_id IN (SELECT id FROM users WHERE first_name ILIKE '%John%' OR email ILIKE '%john%') RETURNING id;");
        console.log("Deleted visits:", res.rows.length);
    } catch (e) {
        console.error(e);
    } finally {
        pool.end();
        process.exit(0);
    }
}
cleanJohn();
