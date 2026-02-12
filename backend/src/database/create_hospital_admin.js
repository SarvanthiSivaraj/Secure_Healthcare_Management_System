const { Pool } = require('pg');
const bcrypt = require('bcrypt');
const config = require('../config/env');

const pool = new Pool({
    host: config.database.host,
    port: config.database.port,
    database: config.database.name,
    user: config.database.user,
    password: config.database.password,
});

const createHospitalAdmin = async () => {
    try {
        console.log('🏥 Creating Hospital Admin user...');

        // Get hospital_admin role ID
        const roleResult = await pool.query("SELECT id FROM roles WHERE name = 'hospital_admin'");

        if (roleResult.rows.length === 0) {
            console.error('❌ hospital_admin role not found in database');
            process.exit(1);
        }

        const hospitalAdminRoleId = roleResult.rows[0].id;

        // Get a hospital organization (or create one if needed)
        let orgResult = await pool.query("SELECT id, name FROM organizations LIMIT 1");

        let organizationId;
        let organizationName;

        if (orgResult.rows.length === 0) {
            // Create a test hospital
            const newOrg = await pool.query(
                `INSERT INTO organizations (name, type, hospital_code, address, phone, email)
                 VALUES ($1, $2, $3, $4, $5, $6)
                 RETURNING id, name`,
                ['General Hospital', 'hospital', '100001', '123 Medical Center Dr', '+1-555-0100', 'contact@generalhospital.com']
            );
            organizationId = newOrg.rows[0].id;
            organizationName = newOrg.rows[0].name;
            console.log(`✅ Created test hospital: ${organizationName} (Code: 100001)`);
        } else {
            organizationId = orgResult.rows[0].id;
            organizationName = orgResult.rows[0].name;
            console.log(`✅ Using existing hospital: ${organizationName}`);
        }

        // Hash password
        const hashedPassword = await bcrypt.hash('HospitalAdmin@123', 10);

        // Create hospital admin user
        const userResult = await pool.query(
            `INSERT INTO users (email, password_hash, first_name, last_name, role_id, is_verified, status)
             VALUES ($1, $2, $3, $4, $5, $6, $7)
             ON CONFLICT (email) DO UPDATE SET
                password_hash = EXCLUDED.password_hash,
                role_id = EXCLUDED.role_id,
                is_verified = true,
                status = 'active'
             RETURNING id, email, first_name, last_name`,
            ['admin@hospital.com', hashedPassword, 'Hospital', 'Administrator', hospitalAdminRoleId, true, 'active']
        );

        const user = userResult.rows[0];

        // Link user to organization via staff_org_mapping
        await pool.query(
            `INSERT INTO staff_org_mapping (user_id, organization_id, role_id, status)
             VALUES ($1, $2, $3, $4)
             ON CONFLICT DO NOTHING`,
            [user.id, organizationId, hospitalAdminRoleId, 'active']
        );

        console.log('\n✅ Hospital Admin user created successfully!');
        console.log('\n📋 CREDENTIALS:');
        console.log('   Email: admin@hospital.com');
        console.log('   Password: HospitalAdmin@123');
        console.log(`   Name: ${user.first_name} ${user.last_name}`);
        console.log(`   Hospital: ${organizationName}`);
        console.log(`   Role: Hospital Administrator`);
        console.log('\n🔗 Login at: http://localhost:3000/login');
        console.log('🏥 Visit Management: http://localhost:3000/admin/visits');

        await pool.end();
        process.exit(0);
    } catch (error) {
        console.error('❌ Failed to create hospital admin:', error);
        await pool.end();
        process.exit(1);
    }
};

createHospitalAdmin();
