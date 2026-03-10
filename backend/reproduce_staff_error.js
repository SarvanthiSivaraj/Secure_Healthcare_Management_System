require('dotenv').config();
const { query } = require('./src/config/db');
const crypto = require('crypto');

async function reproduce() {
    try {
        console.log('--- Reproducing Staff Invitation Error ---');

        const email = `test_${Date.now()}@example.com`;
        const role = 'doctor';
        const invitedBy = 'ed64188b-287a-4274-a690-84cf0ef65e1d'; // System Admin ID from previous steps if available
        // Let's find any admin
        const adminRes = await query("SELECT id FROM users WHERE role_id = (SELECT id FROM roles WHERE name = 'admin' OR name = 'hospital_admin') LIMIT 1");
        if (adminRes.rows.length === 0) {
            console.log('No admin user found to perform invitation.');
            process.exit(1);
        }
        const adminId = adminRes.rows[0].id;
        console.log(`Using Admin ID: ${adminId}`);

        // Find organization
        const orgRes = await query("SELECT id FROM organizations LIMIT 1");
        if (orgRes.rows.length === 0) {
            console.log('No organization found.');
            process.exit(1);
        }
        const orgId = orgRes.rows[0].id;
        console.log(`Using Org ID: ${orgId}`);

        // Try to insert into staff_invitations directly
        const token = crypto.randomBytes(32).toString('hex');
        const expiresAt = new Date();
        expiresAt.setDate(expiresAt.getDate() + 7);

        console.log('Inserting into staff_invitations...');
        const siQuery = `
            INSERT INTO staff_invitations (
                email, role, organization_id, token, invited_by, expires_at, status
            ) VALUES ($1, $2, $3, $4, $5, $6, 'pending')
            RETURNING *;
        `;
        const siValues = [email, role, orgId, token, adminId, expiresAt];
        const siResult = await query(siQuery, siValues);
        console.log('✅ staff_invitations insert successful:', siResult.rows[0].id);

        // Try to log account action
        console.log('Logging account action...');
        const aaQuery = `
            INSERT INTO account_actions (
                user_id, action_type, action_by, metadata
            ) VALUES ($1, $2, $3, $4)
            RETURNING *;
        `;
        const aaMetadata = JSON.stringify({ email, role, invitationId: siResult.rows[0].id });
        const aaResult = await query(aaQuery, [adminId, 'invite', adminId, aaMetadata]);
        console.log('✅ account_actions log successful:', aaResult.rows[0].id);

        console.log('--- Reproduction Successful (No Error) ---');
    } catch (error) {
        console.error('❌ Reproduction failed:');
        console.error(error.message);
        console.error(error.stack);
        if (error.detail) console.error('Detail:', error.detail);
        if (error.hint) console.error('Hint:', error.hint);
    } finally {
        process.exit();
    }
}

reproduce();
