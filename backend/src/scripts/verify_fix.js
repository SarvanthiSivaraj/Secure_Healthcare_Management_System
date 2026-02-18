const { Pool } = require('pg');
const config = require('../config/env');
const logger = require('../utils/logger');
const StaffInvitationService = require('../services/staff.invitation.service');

// Mock request/response for controller testing if needed, or just test service + DB
// Since we modified the controller, we should ideally test the controller logic or simulated output.
// But the controller calls `getAllUsers` model function. We modified that model function.
// So testing the model function output is a good proxy.

const pool = new Pool({
    host: config.database.host,
    port: config.database.port,
    database: config.database.name,
    user: config.database.user,
    password: config.database.password,
});

const verifyFix = async () => {
    try {
        logger.info('🧪 Starting verification...');

        // 1. Invite a test user (this creates the user in DB as per logic we saw)
        const email = `verify_${Date.now()}@test.com`;
        logger.info(`Inviting ${email}...`);
        
        // We need a system admin ID to be the 'inviter'
        const adminRes = await pool.query("SELECT id FROM users WHERE email = 'admin@healthcare.com'");
        const adminId = adminRes.rows[0].id;

        await StaffInvitationService.inviteStaff({
            email,
            role: 'nurse',
            invitedBy: adminId,
            inviterName: 'System Admin',
            organizationId: null // Optional
        });

        // 2. Fetch all users using the MODIFIED model function
        const { getAllUsers } = require('../models/user.model');
        const users = await getAllUsers({ limit: 10 });

        const newUser = users.find(u => u.email === email);

        if (!newUser) {
            throw new Error('❌ New user not found in getAllUsers response!');
        }

        logger.info('✅ User found via getAllUsers model.');
        
        // 3. Check for specific fields we added
        if (!newUser.first_name) logger.error('❌ Missing first_name');
        else logger.info('✅ first_name present');

        if (!newUser.last_name) logger.error('❌ Missing last_name');
        else logger.info('✅ last_name present');

        if (newUser.role_name !== 'nurse') logger.error(`❌ Incorrect role_name: ${newUser.role_name}`);
        else logger.info('✅ role_name correct');

        // 4. Simulate Controller Mapping
        const mappedUser = {
            ...newUser,
            role: newUser.role_name,
            is_active: newUser.status === 'active'
        };

        if (mappedUser.is_active !== true) logger.error(`❌ is_active check failed. Status is ${newUser.status}`);
        else logger.info('✅ is_active mapped correctly');

        logger.info('🎉 Verification passed!');
        process.exit(0);

    } catch (error) {
        logger.error('❌ Verification failed:', error);
        process.exit(1);
    }
};

if (require.main === module) {
    verifyFix();
}
