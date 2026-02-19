require('dotenv').config();
const { pool } = require('./src/config/db');

const deleteUser = async () => {
    const client = await pool.connect();
    try {
        console.log('Attempting to delete user gmharish285@gmail.com...');
        
        await client.query('BEGIN');

        // 1. Get User ID
        const userResult = await client.query("SELECT id FROM users WHERE email = 'gmharish285@gmail.com'");
        
        if (userResult.rowCount === 0) {
            console.log('User not found.');
            await client.query('ROLLBACK');
            process.exit(0);
        }

        const userId = userResult.rows[0].id;
        console.log(`Found User ID: ${userId}`);

        // 2. Delete dependencies (Audit Logs, OTPs, Sessions)
        // Note: Some tables might have ON DELETE CASCADE, but Audit Logs usually don't.
        
        await client.query('DELETE FROM audit_logs WHERE user_id = $1', [userId]);
        console.log('Deleted audit logs.');

        await client.query('DELETE FROM otp_verifications WHERE user_id = $1', [userId]);
        console.log('Deleted OTP verifications.');

        await client.query('DELETE FROM sessions WHERE user_id = $1', [userId]);
        console.log('Deleted sessions.');

        await client.query('DELETE FROM patient_profiles WHERE user_id = $1', [userId]);
        console.log('Deleted patient profile.');
        
        // 3. Delete User
        await client.query('DELETE FROM users WHERE id = $1', [userId]);
        console.log('Successfully deleted user.');

        await client.query('COMMIT');
        process.exit(0);
    } catch (error) {
        await client.query('ROLLBACK');
        console.error('Error deleting user:', error);
        process.exit(1);
    } finally {
        client.release();
    }
};

deleteUser();
