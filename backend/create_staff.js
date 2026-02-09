const { Pool } = require('pg');
const bcrypt = require('bcrypt');
require('dotenv').config({ path: '../.env' });

const pool = new Pool({
    host: process.env.DB_HOST || 'localhost',
    port: process.env.DB_PORT || 5432,
    database: process.env.DB_NAME || 'healthcare_db',
    user: process.env.DB_USER || 'HarishGM',
    password: process.env.DB_PASSWORD || '123456',
});

const seedStaff = async () => {
    try {
        console.log('🌱 Creating staff users...');

        // Get Role IDs
        const roles = await pool.query("SELECT id, name FROM roles WHERE name IN ('nurse', 'hospital_admin', 'pharmacist', 'lab_technician')");
        const roleMap = {};
        roles.rows.forEach(r => roleMap[r.name] = r.id);

        const passwordHash = await bcrypt.hash('Staff@123', 10);
        const adminPasswordHash = await bcrypt.hash('Admin@123', 10);

        const newUsers = [
            { 
                email: 'nurse@healthcare.com', 
                password: passwordHash, 
                firstName: 'Nancy', 
                lastName: 'Nurse', 
                role: 'nurse' 
            },
            { 
                email: 'hosp_admin@healthcare.com', 
                password: adminPasswordHash, 
                firstName: 'Harry', 
                lastName: 'Admin', 
                role: 'hospital_admin' 
            },
            { 
                email: 'pharma@healthcare.com', 
                password: passwordHash, 
                firstName: 'Peter', 
                lastName: 'Pharma', 
                role: 'pharmacist' 
            },
            { 
                email: 'lab@healthcare.com', 
                password: passwordHash, 
                firstName: 'Larry', 
                lastName: 'Lab', 
                role: 'lab_technician' 
            }
        ];

        for (const u of newUsers) {
            if (!roleMap[u.role]) {
                console.warn(`Role ${u.role} not found, skipping user ${u.email}`);
                continue;
            }

            await pool.query(
                `INSERT INTO users (email, password_hash, first_name, last_name, role_id, is_verified, status)
                 VALUES ($1, $2, $3, $4, $5, $6, $7)
                 ON CONFLICT (email) DO NOTHING`,
                [u.email, u.password, u.firstName, u.lastName, roleMap[u.role], true, 'active']
            );
            console.log(`✅ Created user: ${u.email} (${u.role})`);
        }
        
        console.log('🎉 Staff seeding completed!');
    } catch (error) {
        console.error('❌ Staff seeding failed:', error);
    } finally {
        await pool.end();
    }
};

seedStaff();
