const { Pool } = require('pg');
const config = require('./src/config/env');

const pool = new Pool({
    host: config.database.host,
    port: config.database.port,
    database: config.database.name,
    user: config.database.user,
    password: config.database.password,
});

async function checkAdmin() {
    try {
        console.log('Checking Admin User...');
        const userRes = await pool.query(`
            SELECT u.id, u.email, u.role_id, r.name as role_name 
            FROM users u 
            JOIN roles r ON u.role_id = r.id 
            WHERE u.email = 'admin@healthcare.com'
        `);

        if (userRes.rows.length === 0) {
            console.log('❌ Admin user not found!');
        } else {
            console.log('✅ Admin User Found:', userRes.rows[0]);
            const userId = userRes.rows[0].id;

            console.log('Checking Organization Mapping...');
            const orgRes = await pool.query(`
                SELECT som.*, o.name as org_name
                FROM staff_org_mapping som
                JOIN organizations o ON som.organization_id = o.id
                WHERE som.user_id = $1
            `, [userId]);

            if (orgRes.rows.length === 0) {
                console.log('❌ No Organization Mapping found for Admin!');
            } else {
                console.log('✅ Organization Mapping Found:', orgRes.rows);
            }
        }
    } catch (err) {
        console.error('Error:', err);
    } finally {
        pool.end();
    }
}

checkAdmin();
