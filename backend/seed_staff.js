const { Pool } = require('pg');
const bcrypt = require('bcrypt');
require('dotenv').config();

const pool = new Pool({
    host: process.env.DB_HOST || 'localhost',
    port: process.env.DB_PORT || 5432,
    database: process.env.DB_NAME || 'healthcare_db',
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
});

const seedStaffAndOrganization = async () => {
    const client = await pool.connect();
    try {
        await client.query('BEGIN');
        
        console.log('🌱 Starting comprehensive staff seeding...\n');

        // 1. Get Role IDs
        const roleQuery = await client.query(`
            SELECT id, name FROM roles WHERE name IN ('doctor', 'nurse', 'system_admin')
        `);
        const roles = {};
        roleQuery.rows.forEach(r => roles[r.name] = r.id);
        
        console.log('✅ Found roles:', Object.keys(roles).join(', '));

        // 2. Ensure Organization Exists
        const orgResult = await client.query(`
            INSERT INTO organizations (name, type, license_number, status, verified, hospital_code)
            VALUES ($1, $2, $3, $4, $5, $6)
            ON CONFLICT (license_number) DO UPDATE 
            SET name = EXCLUDED.name,
                status = EXCLUDED.status,
                verified = EXCLUDED.verified,
                hospital_code = EXCLUDED.hospital_code
            RETURNING id, name, hospital_code
        `, ['General Hospital', 'hospital', 'ORG-001', 'active', true, '100001']);
        
        const orgId = orgResult.rows[0].id;
        console.log(`✅ Organization: ${orgResult.rows[0].name} (ID: ${orgId}, Code: ${orgResult.rows[0].hospital_code})\n`);

        // 3. Seed Doctors
        const doctors = [
            {
                email: 'dr.smith@hospital.com',
                firstName: 'John',
                lastName: 'Smith',
                license: 'LIC-MD-001',
                specialization: 'Cardiology'
            },
            {
                email: 'dr.jones@hospital.com',
                firstName: 'Sarah',
                lastName: 'Jones',
                license: 'LIC-MD-002',
                specialization: 'Pediatrics'
            },
            {
                email: 'dr.patel@hospital.com',
                firstName: 'Raj',
                lastName: 'Patel',
                license: 'LIC-MD-003',
                specialization: 'Neurology'
            }
        ];

        const hashedPassword = await bcrypt.hash('Doctor@123', 10);

        console.log('📋 Seeding Doctors:');
        for (const dr of doctors) {
            // Upsert User
            const userResult = await client.query(`
                INSERT INTO users (email, password_hash, first_name, last_name, role_id, is_verified, status)
                VALUES ($1, $2, $3, $4, $5, $6, $7)
                ON CONFLICT (email) 
                DO UPDATE SET 
                    first_name = EXCLUDED.first_name,
                    last_name = EXCLUDED.last_name,
                    is_verified = EXCLUDED.is_verified,
                    status = EXCLUDED.status
                RETURNING id
            `, [dr.email, hashedPassword, dr.firstName, dr.lastName, roles.doctor, true, 'active']);
            
            const userId = userResult.rows[0].id;

            // Upsert staff_org_mapping
            await client.query(`
                INSERT INTO staff_org_mapping (user_id, organization_id, role_id, professional_license, license_verified, status)
                VALUES ($1, $2, $3, $4, $5, $6)
                ON CONFLICT (user_id, organization_id) 
                DO UPDATE SET 
                    status = EXCLUDED.status,
                    license_verified = EXCLUDED.license_verified
            `, [userId, orgId, roles.doctor, dr.license, true, 'active']);

            console.log(`   ✅ Dr. ${dr.firstName} ${dr.lastName} (${dr.specialization})`);
        }

        // 4. Seed Nurses
        const nurses = [
            {
                email: 'nurse@healthcare.com',
                firstName: 'Nancy',
                lastName: 'Nurse',
                license: 'LIC-RN-001'
            },
            {
                email: 'nurse.maria@hospital.com',
                firstName: 'Maria',
                lastName: 'Garcia',
                license: 'LIC-RN-002'
            }
        ];

        console.log('\n📋 Seeding Nurses:');
        for (const nurse of nurses) {
            const userResult = await client.query(`
                INSERT INTO users (email, password_hash, first_name, last_name, role_id, is_verified, status)
                VALUES ($1, $2, $3, $4, $5, $6, $7)
                ON CONFLICT (email) 
                DO UPDATE SET 
                    first_name = EXCLUDED.first_name,
                    last_name = EXCLUDED.last_name,
                    is_verified = EXCLUDED.is_verified,
                    status = EXCLUDED.status
                RETURNING id
            `, [nurse.email, hashedPassword, nurse.firstName, nurse.lastName, roles.nurse, true, 'active']);
            
            const userId = userResult.rows[0].id;

            await client.query(`
                INSERT INTO staff_org_mapping (user_id, organization_id, role_id, professional_license, license_verified, status)
                VALUES ($1, $2, $3, $4, $5, $6)
                ON CONFLICT (user_id, organization_id) 
                DO UPDATE SET 
                    status = EXCLUDED.status,
                    license_verified = EXCLUDED.license_verified
            `, [userId, orgId, roles.nurse, nurse.license, true, 'active']);

            console.log(`   ✅ ${nurse.firstName} ${nurse.lastName}`);
        }

        // 5. Ensure Admin is mapped to organization
        const adminResult = await client.query(`
            SELECT id FROM users WHERE email = 'admin@healthcare.com'
        `);

        if (adminResult.rows.length > 0 && roles.system_admin) {
            const adminId = adminResult.rows[0].id;
            await client.query(`
                INSERT INTO staff_org_mapping (user_id, organization_id, role_id, status)
                VALUES ($1, $2, $3, $4)
                ON CONFLICT (user_id, organization_id) 
                DO UPDATE SET status = EXCLUDED.status
            `, [adminId, orgId, roles.system_admin, 'active']);
            console.log('\n   ✅ Admin linked to organization');
        }

        await client.query('COMMIT');

        // 6. Verify Results
        console.log('\n📊 Verification:');
        const doctorCount = await client.query(`
            SELECT COUNT(*) as count 
            FROM users u 
            JOIN roles r ON u.role_id = r.id 
            JOIN staff_org_mapping som ON u.id = som.user_id
            WHERE r.name = 'doctor' 
            AND som.organization_id = $1 
            AND som.status = 'active'
        `, [orgId]);
        
        const nurseCount = await client.query(`
            SELECT COUNT(*) as count 
            FROM users u 
            JOIN roles r ON u.role_id = r.id 
            JOIN staff_org_mapping som ON u.id = som.user_id
            WHERE r.name = 'nurse' 
            AND som.organization_id = $1 
            AND som.status = 'active'
        `, [orgId]);

        console.log(`   👨‍⚕️ Doctors linked to General Hospital: ${doctorCount.rows[0].count}`);
        console.log(`   👩‍⚕️ Nurses linked to General Hospital: ${nurseCount.rows[0].count}`);

        console.log('\n✅ Seeding completed successfully!');
        console.log('\n🔐 Default password for all staff: Doctor@123\n');

    } catch (error) {
        await client.query('ROLLBACK');
        console.error('❌ Seeding failed:', error);
        throw error;
    } finally {
        client.release();
        await pool.end();
    }
};

// Run if executed directly
if (require.main === module) {
    seedStaffAndOrganization()
        .then(() => process.exit(0))
        .catch(err => {
            console.error(err);
            process.exit(1);
        });
}

module.exports = { seedStaffAndOrganization };
