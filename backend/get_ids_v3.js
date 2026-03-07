const { Pool } = require('pg');
require('dotenv').config();
const fs = require('fs');

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
        const data = {
            patientId: p.rows[0]?.id,
            doctorId: d.rows[0]?.id
        };
        fs.writeFileSync('ids.json', JSON.stringify(data, null, 2));
        console.log('IDs written to ids.json');
    } catch (e) {
        console.error(e.message);
    } finally {
        await pool.end();
    }
}

getIds();
