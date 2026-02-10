const { Client } = require('pg');
const config = require('./src/config/env');

async function checkAdmin() {
    const client = new Client({
        host: config.database.host,
        port: config.database.port,
        database: config.database.name,
        user: config.database.user,
        password: config.database.password,
    });

    try {
        await client.connect();
        console.log('Connected to DB');

        // 1. Get Admin User
        const userRes = await client.query("SELECT id, email, first_name, last_name, role_id FROM users WHERE email = 'admin@healthcare.com'");
        if (userRes.rows.length === 0) {
            console.log('❌ Admin user not found!');
            return;
        }
        const admin = userRes.rows[0];
        console.log('✅ Admin found:', admin.email, admin.id);

        // 2. Check Staff Org Mapping
        const mappingRes = await client.query("SELECT * FROM staff_org_mapping WHERE user_id = $1", [admin.id]);
        if (mappingRes.rows.length === 0) {
            console.log('❌ Admin has NO organization mapping!');

            // Fix it?
            console.log('Attempting to fix...');
            // Find an org
            const orgRes = await client.query("SELECT id, name FROM organizations LIMIT 1");
            if (orgRes.rows.length > 0) {
                const org = orgRes.rows[0];
                await client.query(
                    "INSERT INTO staff_org_mapping (user_id, organization_id, role_id, status) VALUES ($1, $2, $3, 'active')",
                    [admin.id, org.id, admin.role_id]
                );
                console.log(`✅ Linked Admin to ${org.name}`);
            } else {
                console.log('❌ No organizations found to link to!');
            }

        } else {
            console.log('✅ Admin is linked to organization:', mappingRes.rows[0].organization_id);
        }

    } catch (err) {
        console.error('Error:', err);
    } finally {
        await client.end();
    }
}

checkAdmin();
