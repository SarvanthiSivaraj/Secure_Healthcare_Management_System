const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '../../.env') });
const { query } = require('../config/db');

async function inspectUser() {
    try {
        console.log('--- DEBUG USER IDENTIFICATION ---');

        // 1. Get latest log user_id
        const logRes = await query("SELECT user_id, action, timestamp FROM audit_logs ORDER BY timestamp DESC LIMIT 1");
        const latestLog = logRes.rows[0];
        console.log('Latest Log:', latestLog);

        if (!latestLog || !latestLog.user_id) {
            console.log('No user_id in latest log');
            process.exit();
        }

        const userId = latestLog.user_id;

        // 2. Identify this user
        const userRes = await query("SELECT * FROM users WHERE id = $1", [userId]);
        const user = userRes.rows[0];
        console.log('User Details for ID', userId, ':', user);

        // 3. Check if patient@example.com matches
        const patientRes = await query("SELECT * FROM users WHERE email = 'patient@example.com'");
        console.log('patient@example.com ID:', patientRes.rows[0]?.id);

    } catch (e) {
        console.error('SCRIPT ERROR:', e);
    } finally {
        process.exit();
    }
}
inspectUser();
