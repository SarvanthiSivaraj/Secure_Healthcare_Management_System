require('dotenv').config();
const { Pool } = require('pg');

const pool = new Pool({
    user: process.env.DB_USER,
    host: process.env.DB_HOST,
    database: process.env.DB_NAME,
    password: process.env.DB_PASSWORD,
    port: process.env.DB_PORT,
});

async function debugCheckIn(code) {
    try {
        console.log(`Checking code: ${code}`);
        const query = `
            SELECT v.*, 
                   u.first_name as patient_first_name, 
                   u.last_name as patient_last_name,
                   u.email as patient_email,
                   o.name as hospital_name
            FROM visits v
            JOIN users u ON v.patient_id = u.id
            JOIN organizations o ON v.organization_id = o.id
            WHERE v.visit_code = $1
        `;
        console.log('Running query...');
        const result = await pool.query(query, [code]);
        console.log('Result Row Count:', result.rows.length);
        if (result.rows.length > 0) {
            console.log('Found Visit:', result.rows[0].id);
        } else {
            console.log('No visit found.');
        }

    } catch (err) {
        console.error('Check-in Query Failed:', err);
    } finally {
        pool.end();
    }
}

debugCheckIn('738339');
