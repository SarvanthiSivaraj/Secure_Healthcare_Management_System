const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '../../.env') });
const { query } = require('../config/db');

async function debugLogs() {
    try {
        console.log('--- DEBUG START ---');

        // 1. Get User by Email
        const userRes = await query("SELECT * FROM users WHERE email = 'patient@example.com'");
        const user = userRes.rows[0];
        console.log('User:', user ? `${user.id} (${user.first_name} ${user.last_name})` : 'NOT FOUND');

        if (!user) process.exit();

        const userId = user.id;

        // 2. Count logs by user_id
        const countUser = await query("SELECT COUNT(*) FROM audit_logs WHERE user_id = $1", [userId]);
        console.log('Logs by user_id:', countUser.rows[0].count);

        // 3. Count logs by entity_id
        const countEntity = await query("SELECT COUNT(*) FROM audit_logs WHERE entity_id = $1", [userId]);
        console.log('Logs by entity_id:', countEntity.rows[0].count);

        // 4. Count logs by metadata patientId
        // precise syntax for jsonb string matching
        const countMeta = await query("SELECT COUNT(*) FROM audit_logs WHERE metadata->>'patientId' = $1", [userId]);
        console.log('Logs by metadata.patientId:', countMeta.rows[0].count);

        // 5. Total logs in DB
        const total = await query("SELECT COUNT(*) FROM audit_logs");
        console.log('TOTAL logs in DB:', total.rows[0].count);

        // 6. Sample logs (first 3)
        const sample = await query("SELECT id, user_id, action, timestamp, metadata FROM audit_logs ORDER BY timestamp DESC LIMIT 3");
        console.log('Latest 3 logs in DB:', sample.rows);

    } catch (e) {
        console.error('SCRIPT ERROR:', e);
    } finally {
        process.exit();
    }
}
debugLogs();
