const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '../../.env') });
const { query } = require('../config/db');

async function dynamicCount() {
    try {
        console.log('--- DYNAMIC DEBUG FIX ---');

        // 1. Find User(s)
        const userRes = await query("SELECT id, email, first_name, last_name, created_at FROM users WHERE email = 'patient@example.com'");
        const user = userRes.rows[0];
        console.log('User found:', user);

        if (!user) {
            console.log('No user found');
            process.exit();
        }

        const userId = user.id;

        // 2. Count logs by user_id
        const countRes = await query("SELECT COUNT(*) FROM audit_logs WHERE user_id = $1", [userId]);
        console.log('Log Count (user_id):', countRes.rows[0].count);

        // 3. List recent 10 logs
        const recentRes = await query("SELECT action, timestamp, purpose, ip_address FROM audit_logs WHERE user_id = $1 ORDER BY timestamp DESC LIMIT 10", [userId]);
        console.log('Recent Logs:', recentRes.rows);

    } catch (e) {
        console.error('SCRIPT ERROR:', e);
    } finally {
        process.exit();
    }
}
dynamicCount();
