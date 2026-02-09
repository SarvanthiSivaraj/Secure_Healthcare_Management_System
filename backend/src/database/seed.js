const { Pool } = require('pg');
const bcrypt = require('bcrypt');
const config = require('../config/env');
const logger = require('../utils/logger');

const pool = new Pool({
    host: config.database.host,
    port: config.database.port,
    database: config.database.name,
    user: config.database.user,
    password: config.database.password,
});

const seed = async () => {
    try {
        logger.info('🌱 Starting database seeding...');

        // 1. Seed Roles
        const roles = [
            { name: 'patient', description: 'Patient - Primary data owner' },
            { name: 'doctor', description: 'Doctor - Medical professional with clinical access' },
            { name: 'nurse', description: 'Nurse - Care provider with shift-based access' },
            { name: 'lab_technician', description: 'Laboratory Technician - Lab test processing' },
            { name: 'radiologist', description: 'Radiologist - Imaging and radiology specialist' },
            { name: 'pharmacist', description: 'Pharmacist - Medication dispensing' },
            { name: 'hospital_admin', description: 'Hospital Administrator - Staff and facility management' },
            { name: 'system_admin', description: 'System Administrator - Platform administration' },
            { name: 'insurance_provider', description: 'Insurance Provider - Billing data access only' },
            { name: 'researcher', description: 'Researcher - Anonymized data access' },
            { name: 'compliance_officer', description: 'Compliance Officer - Audit and compliance review' },
        ];

        for (const role of roles) {
            await pool.query(
                `INSERT INTO roles (name, description) 
                 VALUES ($1, $2) 
                 ON CONFLICT (name) DO NOTHING`,
                [role.name, role.description]
            );
        }
        logger.info('✅ Roles seeded');

        // 2. Seed Admin User
        const adminRoleId = (await pool.query("SELECT id FROM roles WHERE name = 'system_admin'")).rows[0].id;
        const doctorRole = (await pool.query("SELECT id FROM roles WHERE name = 'doctor'")).rows[0].id;
        const patientRole = (await pool.query("SELECT id FROM roles WHERE name = 'patient'")).rows[0].id;

        const hashedPassword = await bcrypt.hash('Admin@123', 10);
        const doctorPassword = await bcrypt.hash('Doctor@123', 10);
        const patientPassword = await bcrypt.hash('Patient@123', 10);

        // Seed Admin
        await pool.query(
            `INSERT INTO users (email, password_hash, first_name, last_name, role_id, is_verified, status)
             VALUES ($1, $2, $3, $4, $5, $6, $7)
             ON CONFLICT (email) DO NOTHING`,
            ['admin@healthcare.com', hashedPassword, 'System', 'Admin', adminRoleId, true, 'active']
        );
        logger.info('✅ Default Admin user seeded (admin@healthcare.com / Admin@123)');

        // Seed Doctors
        const doctors = [
            { email: 'raj@healthcare.com', firstName: 'Raj', lastName: 'Kumar', specialization: 'Cardiology' },
            { email: 'sarah@healthcare.com', firstName: 'Sarah', lastName: 'Johnson', specialization: 'Pediatrics' },
            { email: 'emily@healthcare.com', firstName: 'Emily', lastName: 'Davis', specialization: 'General Practice' }
        ];

        for (const doc of doctors) {
            const userRes = await pool.query(
                `INSERT INTO users (email, password_hash, first_name, last_name, role_id, is_verified, status)
                 VALUES ($1, $2, $3, $4, $5, $6, $7)
                 ON CONFLICT (email) DO UPDATE SET 
                    first_name = EXCLUDED.first_name,
                    last_name = EXCLUDED.last_name
                 RETURNING id`,
                [doc.email, doctorPassword, doc.firstName, doc.lastName, doctorRole, true, 'active']
            );
            
            const userId = userRes.rows[0].id;

            await pool.query(
                `INSERT INTO doctor_profiles (user_id, specialization, license_number, experience_years)
                 VALUES ($1, $2, $3, $4)
                 ON CONFLICT (user_id) DO NOTHING`,
                [userId, doc.specialization, 'LIC-' + Math.floor(Math.random() * 10000), 5]
            );
        }
        logger.info('✅ Doctor users seeded (Password: Doctor@123)');

        // Seed Patient
        const patientUser = await pool.query(
            `INSERT INTO users (email, password_hash, first_name, last_name, role_id, is_verified, status)
             VALUES ($1, $2, $3, $4, $5, $6, $7)
             ON CONFLICT (email) DO UPDATE SET status = 'active'
             RETURNING id`,
            ['patient@example.com', patientPassword, 'John', 'Doe', patientRole, true, 'active']
        );
        
        const patientId = patientUser.rows[0].id;
        
        await pool.query(
            `INSERT INTO patient_profiles (user_id, date_of_birth, gender, address)
             VALUES ($1, $2, $3, $4)
             ON CONFLICT (user_id) DO NOTHING`,
            [patientId, '1990-01-01', 'Male', '123 Main St']
        );
        logger.info('✅ Patient user seeded (patient@example.com / Patient@123)');

        logger.info('✅ Database seeding completed successfully');
        process.exit(0);
    } catch (error) {
        logger.error('❌ Database seeding failed:', error);
        process.exit(1);
    }
};

if (require.main === module) {
    seed();
}

module.exports = { seed };
