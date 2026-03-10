require('dotenv').config();
const { Pool } = require('pg');
const fs = require('fs');

const pool = new Pool({
    host: process.env.DB_HOST || 'localhost',
    port: process.env.DB_PORT || 5432,
    database: process.env.DB_NAME || 'healthcare_db',
    user: process.env.DB_USER || 'postgres',
    password: process.env.DB_PASSWORD || 'postgres',
});

async function getLogins() {
    const roles = [
        'patient',
        'doctor',
        'nurse',
        'lab_technician',
        'radiologist',
        'pharmacist',
        'hospital_admin',
        'system_admin',
        'insurance_provider',
        'researcher',
        'compliance_officer'
    ];

    let output = '';

    try {
        for (const roleName of roles) {
            const query = "SELECT u.email, r.name as role FROM users u JOIN roles r ON u.role_id = r.id WHERE r.name = $1 LIMIT 1";
            const res = await pool.query(query, [roleName]);
            if (res.rows.length > 0) {
                output += "Role: " + roleName.padEnd(20) + " | Email: " + res.rows[0].email + "\n";
            } else {
                output += "Role: " + roleName.padEnd(20) + " | No user found\n";
            }
        }
        fs.writeFileSync('logins.txt', output);
        console.log('Done writing logins.txt');
    } catch (e) {
        console.error(e);
    } finally {
        pool.end();
    }
}

getLogins();
