const { Client } = require('pg');
require('dotenv').config({ path: '../.env' });

const client = new Client({
    host: process.env.DB_HOST || 'localhost',
    port: process.env.DB_PORT || 5432,
    database: process.env.DB_NAME || 'healthcare_db',
    user: process.env.DB_USER || 'HarishGM',
    password: process.env.DB_PASSWORD || '123456',
});

async function checkUsers() {
    try {
        await client.connect();
        
        const query = `
            SELECT u.id, u.email, u.first_name, u.last_name, r.name as role
            FROM users u
            JOIN roles r ON u.role_id = r.id
            WHERE r.name IN ('nurse', 'lab_technician', 'pharmacist', 'hospital_admin', 'receptionist')
            ORDER BY r.name;
        `;
        
        const res = await client.query(query);
        
        if (res.rows.length === 0) {
            console.log('No Nurse or Staff users found.');
        } else {
            console.table(res.rows);
        }
        
    } catch (err) {
        console.error('Error:', err);
    } finally {
        await client.end();
    }
}

checkUsers();
