const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '../../.env') });
const { query } = require('../config/db');

async function checkStatus() {
    try {
        console.log('Checking patient status...');
        const result = await query("SELECT email, status, is_verified FROM users WHERE email = 'patient@example.com'");
        console.log('Patient Status:', result.rows);
    } catch (e) {
        console.error('SCRIPT ERROR:', e);
    } finally {
        process.exit();
    }
}
checkStatus();
