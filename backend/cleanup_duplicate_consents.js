require('dotenv').config();
const { query } = require('./src/config/db');

async function cleanup() {
    // Revoke all but the LATEST active consent per (patient_id, recipient_user_id) pair
    const result = await query(`
        UPDATE consents
        SET status = 'revoked', updated_at = NOW()
        WHERE id IN (
            SELECT id FROM (
                SELECT id,
                       ROW_NUMBER() OVER (
                         PARTITION BY patient_id, recipient_user_id
                         ORDER BY created_at DESC
                       ) AS rn
                FROM consents
                WHERE status = 'active'
            ) ranked
            WHERE rn > 1
        )
        RETURNING id
    `);
    console.log('Revoked', result.rows.length, 'duplicate consent(s):', result.rows.map(r => r.id).join(', ') || 'none');
    process.exit(0);
}

cleanup().catch(e => { console.error('Cleanup failed:', e.message); process.exit(1); });
