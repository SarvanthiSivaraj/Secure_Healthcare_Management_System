require('dotenv').config({ path: '../../.env' });
const { pool } = require('../config/db');

const emailToDelete = process.argv[2];

if (!emailToDelete) {
    console.error('Please provide an email address as an argument.');
    console.error('Usage: node src/scripts/cleanupUser.js <email>');
    process.exit(1);
}

const deleteUser = async () => {
    const client = await pool.connect();
    try {
        console.log(`Attempting to delete user ${emailToDelete}...`);
        
        await client.query('BEGIN');

        // 1. Get User ID
        const userResult = await client.query("SELECT id FROM users WHERE email = $1", [emailToDelete]);
        
        if (userResult.rowCount === 0) {
            console.log('User not found.');
            await client.query('ROLLBACK');
            process.exit(0);
        }

        const userId = userResult.rows[0].id;
        console.log(`Found User ID: ${userId}`);

        // 2. Delete dependencies
        // Audit Logs
        await client.query('DELETE FROM audit_logs WHERE user_id = $1', [userId]);
        
        // OTP Verifications
        await client.query('DELETE FROM otp_verifications WHERE user_id = $1', [userId]);
        
        // Sessions
        await client.query('DELETE FROM sessions WHERE user_id = $1', [userId]);

        // Profiles (Patient/Doctor)
        await client.query('DELETE FROM patient_profiles WHERE user_id = $1', [userId]);
        await client.query('DELETE FROM doctor_profiles WHERE user_id = $1', [userId]);
        
        // Staff Org Mapping
        await client.query('DELETE FROM staff_org_mapping WHERE user_id = $1', [userId]);

        // 3. Delete User
        await client.query('DELETE FROM users WHERE id = $1', [userId]);
        console.log('Successfully deleted user and all related data.');

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
