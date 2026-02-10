const { Pool } = require('pg');
require('dotenv').config();

const pool = new Pool({
    host: process.env.DB_HOST,
    port: process.env.DB_PORT,
    database: process.env.DB_NAME,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
});

async function checkMapping() {
    try {
        console.log('Checking Admin Organization Mapping...');

        // Get Admin User
        const userRes = await pool.query("SELECT id, email, role_id FROM users WHERE email = 'admin@healthcare.com'");
        if (userRes.rows.length === 0) {
            console.log('❌ Admin user not found!');
            return;
        }
        const admin = userRes.rows[0];
        console.log(`Found Admin: ${admin.email} (ID: ${admin.id})`);

        // Get Role Name
        const roleRes = await pool.query("SELECT name FROM roles WHERE id = $1", [admin.role_id]);
        console.log(`Admin Role: ${roleRes.rows[0]?.name}`);

        // Check Mapping
        const mapRes = await pool.query("SELECT * FROM staff_org_mapping WHERE user_id = $1", [admin.id]);
        if (mapRes.rows.length === 0) {
            console.log('❌ No organization mapping found for Admin!');

            // Fix it by finding an org and linking it
            console.log('Attempting to fix...');
            const orgRes = await pool.query("SELECT id, name FROM organizations LIMIT 1");
            if (orgRes.rows.length > 0) {
                const org = orgRes.rows[0];
                await pool.query(
                    "INSERT INTO staff_org_mapping (user_id, organization_id, role_id, status) VALUES ($1, $2, $3, 'active')",
                    [admin.id, org.id, admin.role_id]
                );
                console.log(`✅ Fixed: Linked Admin to ${org.name}`);
            } else {
                console.log('❌ No organizations found to link!');
            }
        } else {
            console.log('✅ Organization mapping exists:', mapRes.rows[0]);
        }

    } catch (err) {
        console.error('Error:', err);
    } finally {
        pool.end();
    }
}

checkMapping();
