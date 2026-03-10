require('dotenv').config();
const db = require('./src/config/db');

async function run() {
    try {
        const email = 'sarvanthikha211@gmail.com';
        const userRes = await db.query("SELECT id FROM users WHERE email = $1", [email]);
        if (userRes.rows.length > 0) {
            const userId = userRes.rows[0].id;
            await db.query("DELETE FROM audit_logs WHERE user_id = $1", [userId]);
            await db.query("DELETE FROM otp_verifications WHERE user_id = $1 OR email = $2", [userId, email]);
            await db.query("DELETE FROM verification_documents WHERE user_id = $1", [userId]);
            await db.query("DELETE FROM users WHERE id = $1", [userId]);
            console.log(`User ${email} and all related data deleted`);
        } else {
            console.log(`User ${email} not found`);
        }
    } catch (err) {
        console.error(err);
    } finally {
        process.exit(0);
    }
}
run();
