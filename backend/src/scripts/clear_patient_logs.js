const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '../../.env') });
const { query } = require('../config/db');

async function clearLogs() {
    try {
        console.log('--- CLEARING LOGS ---');

        // 1. Find User by Email
        const userRes = await query("SELECT id FROM users WHERE email = 'patient@example.com'");
        const userId = userRes.rows[0]?.id;

        if (!userId) {
            console.log('User not found');
            process.exit();
        }
        console.log('User ID:', userId);

        // 2. Delete Logs
        const deleteRes = await query("DELETE FROM audit_logs WHERE user_id = $1", [userId]);
        console.log('Deleted Logs:', deleteRes.rowCount);

    } catch (e) {
        console.error('SCRIPT ERROR:', e);
    } finally {
        process.exit();
    }
}
clearLogs();
