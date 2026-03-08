require('dotenv').config();
const { query } = require('./src/config/db');

async function cleanAndCheck() {
    try {
        console.log('--- Cleaning up Test Gmail ---');

        // 1. Get user IDs to be deleted
        const emailsToDelete = ['srsarvanthikha@gmail.com', 'test_1772952263307@example.com'];
        const userRes = await query(`
            SELECT id, email FROM users 
            WHERE email = ANY($1) OR email LIKE '%test%gmail%' OR email LIKE '%test%example%'
        `, [emailsToDelete]);

        const userIds = userRes.rows.map(r => r.id);
        console.log('User IDs to clean up:', userIds);

        if (userIds.length > 0) {
            for (let id of userIds) {
                console.log(`Cleaning dependent records for user ${id}...`);
                // Delete from consent tables if any
                await query('DELETE FROM consents WHERE patient_id = $1 OR recipient_user_id = $1', [id]);
                // Delete from visits if any (patient)
                await query('DELETE FROM visits WHERE patient_id = $1', [id]);
                // Delete from visit_staff_assignments
                await query('DELETE FROM visit_staff_assignments WHERE staff_user_id = $1', [id]);
                // Delete from staff_org_mapping
                await query('DELETE FROM staff_org_mapping WHERE user_id = $1', [id]);
                // Delete from audit_logs
                await query('DELETE FROM audit_logs WHERE user_id = $1', [id]);
                // Delete from account_actions where user is the target or actor
                await query('DELETE FROM account_actions WHERE user_id = $1 OR action_by = $1', [id]);
            }
        }

        // Delete from staff_invitations
        const invRes = await query(`
            DELETE FROM staff_invitations 
            WHERE email = ANY($1) OR email LIKE '%test%gmail%' OR email LIKE '%test%example%'
            RETURNING email;
        `, [emailsToDelete]);
        console.log('Deleted invitations for:', invRes.rows.map(r => r.email));

        if (userIds.length > 0) {
            // Delete users
            const deletedUsers = await query(`
                DELETE FROM users WHERE id = ANY($1) RETURNING email;
            `, [userIds]);
            console.log('Deleted users for:', deletedUsers.rows.map(r => r.email));
        }

        console.log('\n--- Checking History (Audit Logs) ---');
        const auditRes = await query(`
            SELECT a.id, a.action_type, u.email as action_by_email, a.created_at
            FROM account_actions a
            LEFT JOIN users u ON a.action_by = u.id
            WHERE a.action_type IN ('invite', 'accept_invitation', 'cancel_invitation')
            ORDER BY a.created_at DESC
            LIMIT 5;
        `);
        console.table(auditRes.rows);

    } catch (e) {
        console.error('Error:', e);
    } finally {
        process.exit();
    }
}

cleanAndCheck();
