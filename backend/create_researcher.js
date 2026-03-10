require('dotenv').config();
const { pool } = require('./src/config/db');
const bcrypt = require('bcrypt');

async function createResearcher() {
    try {
        console.log('--- Creating Researcher Account ---');
        const hashedPassword = await bcrypt.hash('Researcher@123', 10);

        // Find role id for researcher
        const roleRes = await pool.query("SELECT id FROM roles WHERE name = 'researcher'");
        if (roleRes.rows.length === 0) {
            console.error('Role "researcher" not found!');
            process.exit(1);
        }
        const roleId = roleRes.rows[0].id;

        const result = await pool.query(
            `INSERT INTO users (email, password_hash, first_name, last_name, role_id, is_verified, status)
             VALUES ($1, $2, $3, $4, $5, $6, $7)
             ON CONFLICT (email) DO UPDATE SET 
                password_hash = EXCLUDED.password_hash,
                status = 'active',
                is_verified = true
             RETURNING email`,
            ['researcher@healthcare.com', hashedPassword, 'Alice', 'Researcher', roleId, true, 'active']
        );

        console.log('✅ Researcher user created/updated:', result.rows[0].email);

        // Also ensure staff mapping if required for login (though researcher might not need it depending on auth logic)
        // But let's check if there's an organization to link to
        const orgRes = await pool.query("SELECT id FROM organizations LIMIT 1");
        if (orgRes.rows.length > 0) {
            const userIdRes = await pool.query("SELECT id FROM users WHERE email = $1", ['researcher@healthcare.com']);
            const userId = userIdRes.rows[0].id;
            const orgId = orgRes.rows[0].id;

            await pool.query(
                `INSERT INTO staff_org_mapping (user_id, organization_id, role_id, status)
                 VALUES ($1, $2, $3, $4)
                 ON CONFLICT (user_id, organization_id) DO UPDATE SET status = 'active'`,
                [userId, orgId, roleId, 'active']
            );
            console.log('✅ Linked researcher to organization');
        }

        process.exit(0);
    } catch (err) {
        console.error('❌ Failed to create researcher:', err);
        process.exit(1);
    }
}

createResearcher();
