const { Pool } = require('pg');
const config = require('../config/env');
const logger = require('../utils/logger');

const pool = new Pool({
    host: config.database.host,
    port: config.database.port,
    database: config.database.name,
    user: config.database.user,
    password: config.database.password,
});

const clearStaff = async () => {
    try {
        logger.info('🧹 Starting staff cleanup...');

        // Get System Admin Role ID
        const adminRoleRes = await pool.query("SELECT id FROM roles WHERE name = 'system_admin'");
        
        if (adminRoleRes.rows.length === 0) {
            logger.error('❌ System Admin role not found! Aborting to prevent data loss.');
            process.exit(1);
        }

        const adminRoleId = adminRoleRes.rows[0].id;

        
        // Delete dependent records first to satisfy FK constraints
        logger.info('   - Cleaning up audit logs...');
        await pool.query('DELETE FROM audit_logs WHERE user_id IN (SELECT id FROM users WHERE role_id != $1)', [adminRoleId]);
        
        logger.info('   - Cleaning up staff org mappings...');
        await pool.query('DELETE FROM staff_org_mapping WHERE user_id IN (SELECT id FROM users WHERE role_id != $1)', [adminRoleId]);

        logger.info('   - Cleaning up patient profiles...');
        await pool.query('DELETE FROM patient_profiles WHERE user_id IN (SELECT id FROM users WHERE role_id != $1)', [adminRoleId]);

        logger.info('   - Cleaning up doctor profiles...');
        await pool.query('DELETE FROM doctor_profiles WHERE user_id IN (SELECT id FROM users WHERE role_id != $1)', [adminRoleId]);

        // Add other dependent tables as needed (e.g. visits, consents, etc.)
        // For a full clear, we might need to be more aggressive, but let's start with known blockers.

        const deleteRes = await pool.query(
            `DELETE FROM users 
             WHERE role_id != $1 
             RETURNING id, email`,
            [adminRoleId]
        );

        logger.info(`✅ Deleted ${deleteRes.rowCount} users.`);
        deleteRes.rows.forEach(user => {
            logger.info(`   - Deleted: ${user.email}`);
        });

        // Also clear invitations
        const inviteDeleteRes = await pool.query('DELETE FROM staff_invitations');
        logger.info(`✅ Deleted ${inviteDeleteRes.rowCount} invitations.`);

        logger.info('🎉 Staff cleanup completed successfully.');
        process.exit(0);
    } catch (error) {
        logger.error('❌ Staff cleanup failed:', error);
        process.exit(1);
    }
};

if (require.main === module) {
    clearStaff();
}

module.exports = { clearStaff };
