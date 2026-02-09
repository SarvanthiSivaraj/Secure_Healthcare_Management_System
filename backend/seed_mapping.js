const { Client } = require('pg');
require('dotenv').config({ path: '../.env' });

const client = new Client({
    host: process.env.DB_HOST || 'localhost',
    port: process.env.DB_PORT || 5432,
    database: process.env.DB_NAME || 'healthcare_db',
    user: process.env.DB_USER || 'HarishGM',
    password: process.env.DB_PASSWORD || '123456',
});

async function seedMapping() {
    try {
        await client.connect();
        
        // Get Role IDs
        const roles = await client.query(`SELECT id, name FROM roles`);
        const roleMap = {};
        roles.rows.forEach(r => roleMap[r.name] = r.id);

        // Get User IDs (hosp_admin, nurse, lab_tech, pharmacist)
        const users = await client.query(`
            SELECT id, email, role_id FROM users 
            WHERE email IN ('hosp_admin@healthcare.com', 'nurse@healthcare.com', 'pharma@healthcare.com', 'lab@healthcare.com')
        `);
        const userMap = {};
        users.rows.forEach(u => userMap[u.email] = u.id);

        // Get Org ID
        const orgRes = await client.query(`SELECT id FROM organizations LIMIT 1`);
        const orgId = orgRes.rows[0].id;

        // Create mappings
        const mappings = [
            { email: 'hosp_admin@healthcare.com', role: 'hospital_admin' },
            { email: 'nurse@healthcare.com', role: 'nurse' },
            { email: 'pharma@healthcare.com', role: 'pharmacist' },
            { email: 'lab@healthcare.com', role: 'lab_technician' }
        ];

        for (const m of mappings) {
            if (userMap[m.email]) {
                await client.query(`
                    INSERT INTO staff_org_mapping (user_id, organization_id, role_id, status)
                    VALUES ($1, $2, $3, 'active')
                    ON CONFLICT(user_id, organization_id) DO NOTHING
                `, [userMap[m.email], orgId, roleMap[m.role]]);
                console.log(`✅ Linked ${m.email} to organization`);
            }
        }

    } catch (err) {
        console.error('Error:', err);
    } finally {
        await client.end();
    }
}

seedMapping();
