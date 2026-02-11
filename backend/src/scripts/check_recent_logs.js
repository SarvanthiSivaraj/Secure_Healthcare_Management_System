const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '../../.env') });
const { query } = require('../config/db');

async function checkRecentLogs() {
    try {
        console.log('--- CHECK RECENT LOGS ---');
        const res = await query(`
            SELECT id, user_id, action, entity_type, entity_id, timestamp 
            FROM audit_logs 
            ORDER BY timestamp DESC 
            LIMIT 10
        `);
        console.table(res.rows);
    } catch (e) {
        console.error(e);
    } finally {
        process.exit();
    }
}

checkRecentLogs();
