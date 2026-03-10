require('dotenv').config();
const { pool } = require('./config/db');
const logger = require('./utils/logger');

async function setupSecurityEvents() {
    try {
        console.log('--- Setting up Security Events Table ---');

        // 1. Ensure status column exists
        await pool.query(`
            ALTER TABLE security_events 
            ADD COLUMN IF NOT EXISTS status VARCHAR(20) DEFAULT 'Open'
        `);

        // 2. Clear existing data
        await pool.query('DELETE FROM security_events');

        // 3. Seed 8 incidents with real statuses
        const incidents = [
            { type: 'suspicious_activity', sev: 'high', status: 'Open', desc: 'Abnormal EMR Access: Multiple record views within 1 min from non-clinical IP.', reporter: 'System IDS' },
            { type: 'suspicious_activity', sev: 'critical', status: 'Investigating', desc: 'Bulk Export Detected: 500+ records exported outside standard hours.', reporter: 'DLP Engine' },
            { type: 'failed_login', sev: 'medium', status: 'Open', desc: 'Brute force attempt detected on admin account from IP 192.168.1.45.', reporter: 'Auth Guard' },
            { type: 'role_change', sev: 'high', status: 'Open', desc: 'Unauthorized Role Escalation: Patient account upgraded to Doctor role.', reporter: 'RBAC Monitor' },
            { type: 'suspicious_activity', sev: 'low', status: 'Resolved', desc: 'After-hours login from a nurse account currently on leave.', reporter: 'Access Logger' },
            { type: 'account_locked', sev: 'medium', status: 'Open', desc: 'Account locked for user dr.smith@medicare.com after 10 failed attempts.', reporter: 'Security Policy' },
            { type: 'suspicious_activity', sev: 'medium', status: 'Open', desc: 'Access to VIP patient records without a valid clinical reason.', reporter: 'Privacy Watch' },
            { type: 'password_reset', sev: 'low', status: 'Investigating', desc: 'Multiple password reset requests for the same account within 5 minutes.', reporter: 'Identity Service' }
        ];

        console.log(`Seeding ${incidents.length} security events...`);

        for (const inc of incidents) {
            await pool.query(`
                INSERT INTO security_events (event_type, severity, description, status, metadata, resolved)
                VALUES ($1, $2, $3, $4, $5, $6)
            `, [inc.type, inc.sev, inc.desc, inc.status, JSON.stringify({ reporter: inc.reporter }), inc.status === 'Resolved']);
        }

        console.log('--- Security Events Setup Complete ---');
        process.exit(0);
    } catch (err) {
        console.error('Failed to setup security events:', err);
        process.exit(1);
    }
}

setupSecurityEvents();
