
require('dotenv').config();
const { query } = require('./src/config/db');

async function checkUser() {
    try {
        const result = await query(`
            SELECT u.*, r.name as role_name
            FROM users u
            LEFT JOIN roles r ON u.role_id = r.id
            WHERE u.email = 'hosp_admin@healthcare.com'
        `);

        if (result.rows.length === 0) {
            console.log('User not found');
        } else {
            console.log('User found:', result.rows[0]);
        }
    } catch (err) {
        console.error('Error:', err);
    }
}

checkUser();
