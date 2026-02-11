const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '../../.env') });
const { query } = require('../config/db');

async function countLogs() {
    try {
        const patientId = 'b6e326c2-03d6-4447-9df0-711fa72d3f23';
        console.log('Counting logs for patient:', patientId);

        const countResult = await query(
            "SELECT COUNT(*) FROM audit_logs WHERE user_id = $1 OR entity_id = $1",
            [patientId]
        );
        console.log('Count matches:', countResult.rows[0]);

        console.log('Listing recent 20 logs:');
        const logs = await query(
            "SELECT action, timestamp, purpose FROM audit_logs WHERE user_id = $1 OR entity_id = $1 ORDER BY timestamp DESC LIMIT 20",
            [patientId]
        );
        console.log(logs.rows);

        console.log('Checking Patient Name:');
        const user = await query("SELECT first_name, last_name FROM users WHERE id = $1", [patientId]);
        console.log(user.rows[0]);

    } catch (e) {
        console.error('SCRIPT ERROR:', e);
    } finally {
        process.exit();
    }
}
countLogs();
