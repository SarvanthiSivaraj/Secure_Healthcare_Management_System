require('dotenv').config();
const { Pool } = require('pg');
const fs = require('fs');

const pool = new Pool({
    host: process.env.DB_HOST || 'localhost',
    port: process.env.DB_PORT || 5432,
    database: process.env.DB_NAME || 'healthcare_db',
    user: process.env.DB_USER || 'postgres',
    password: process.env.DB_PASSWORD || 'postgres',
    ssl: process.env.DB_HOST && !process.env.DB_HOST.includes('localhost') ? { rejectUnauthorized: false } : false,
});

const PASSWORDS = {
    'system_admin': 'Admin@123',
    'hospital_admin': 'Admin@123',
    'doctor': 'Doctor@123',
    'nurse': 'Nurse@123',
    'patient': 'Patient@123',
    'receptionist': 'Receptionist@123'
};

const DEFAULT_STAFF_PASSWORD = 'Staff@123';

async function fetchCredentials() {
    try {
        console.log(`Checking database: ${process.env.DB_HOST} / ${process.env.DB_NAME}`);
        const query = `
            SELECT u.email, r.name as role 
            FROM users u 
            JOIN roles r ON u.role_id = r.id 
            WHERE u.status = 'active'
            ORDER BY r.name, u.email
        `;
        const res = await pool.query(query);

        let output = '━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n';
        output += '📋 Login Credentials for Active Users\n';
        output += '━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n';
        output += `${'Role'.padEnd(20)} | ${'Email'.padEnd(35)} | ${'Password'}\n`;
        output += '─────────────────────|─────────────────────────────────────|──────────────\n';

        res.rows.forEach(user => {
            const password = PASSWORDS[user.role] || DEFAULT_STAFF_PASSWORD;
            output += `${user.role.padEnd(20)} | ${user.email.padEnd(35)} | ${password}\n`;
        });
        output += '━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n';

        fs.writeFileSync('credentials_list.txt', output, 'utf8');
        console.log('Results written to credentials_list.txt');

    } catch (err) {
        console.error('Error fetching credentials:', err.message);
    } finally {
        await pool.end();
    }
}

fetchCredentials();
