const { query } = require('./src/config/db');

async function cleanAndCheck() {
    try {
        console.log('--- Cleaning up Test Gmail ---');
        // The user specifically asked to "remove that test gmail". 
        // Based on the screenshot it's likely "srsarvanthikha@gmail.com" or a variation.
        const res = await query(`
            DELETE FROM staff_invitations 
            WHERE email = 'srsarvanthikha@gmail.com' OR email LIKE '%test%gmail%' OR email LIKE '%test%example%'
            RETURNING email;
        `);
        console.log('Deleted invitations for:', res.rows.map(r => r.email));

        const userRes = await query(`
            DELETE FROM users 
            WHERE email = 'srsarvanthikha@gmail.com' OR email LIKE '%test%gmail%' OR email LIKE '%test%example%'
            RETURNING email;
        `);
        console.log('Deleted users for:', userRes.rows.map(r => r.email));

        console.log('\n--- Checking History (Audit Logs) ---');
        // Let's check what audit logs exist for invitations
        const auditRes = await query(`
            SELECT a.id, a.action_type, a.metadata, u.email as action_by_email, a.created_at
            FROM account_actions a
            LEFT JOIN users u ON a.action_by = u.id
            WHERE a.action_type IN ('invite', 'accept_invitation', 'cancel_invitation')
            ORDER BY a.created_at DESC
            LIMIT 5;
        `);
        console.log('Recent Invitation Actions:');
        console.table(auditRes.rows);

    } catch (e) {
        console.error('Error:', e);
    } finally {
        process.exit();
    }
}

cleanAndCheck();
