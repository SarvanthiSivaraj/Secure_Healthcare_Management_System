const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '../../.env') });
const { query } = require('../config/db');

async function analyzeLogins() {
    try {
        console.log('--- LOGIN ANALYSIS ---');

        // 1. Find User by Email
        const userRes = await query("SELECT id FROM users WHERE email = 'patient@example.com'");
        const userId = userRes.rows[0]?.id;

        if (!userId) {
            console.log('User not found');
            process.exit();
        }
        console.log('User ID:', userId);

        // 2. Count Login Actions
        const countRes = await query("SELECT COUNT(*) FROM audit_logs WHERE user_id = $1 AND action = 'user_login'", [userId]);
        console.log('Login Count:', countRes.rows[0].count);

        // 3. List recent logins
        const recentRes = await query("SELECT timestamp, ip_address, user_agent FROM audit_logs WHERE user_id = $1 AND action = 'user_login' ORDER BY timestamp DESC LIMIT 10", [userId]);
        console.log('Recent Logins:', recentRes.rows);

    } catch (e) {
        console.error('SCRIPT ERROR:', e);
    } finally {
        process.exit();
    }
}
analyzeLogins();
