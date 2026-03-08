const { Pool } = require('pg');
require('dotenv').config();

const pool = new Pool({
    host: process.env.DB_HOST,
    port: process.env.DB_PORT,
    database: process.env.DB_NAME,
    user: process.env.DB_USER,
    password: String(process.env.DB_PASSWORD),
});

async function getIds() {
    try {
        const p = await pool.query("SELECT id FROM users WHERE email = 'patient@example.com'");
        const d = await pool.query("SELECT u.id FROM users u JOIN roles r ON u.role_id = r.id WHERE r.name = 'doctor' LIMIT 1");
        console.log(`PATIENT_ID=${p.rows[0]?.id}`);
        console.log(`DOCTOR_ID=${d.rows[0]?.id}`);
    } catch (e) {
        console.error(e.message);
    } finally {
        await pool.end();
    }
}

getIds();
