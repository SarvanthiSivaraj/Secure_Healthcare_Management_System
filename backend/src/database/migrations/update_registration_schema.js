const { Pool } = require('pg');
const fs = require('fs');
const path = require('path');
const config = require('../../config/env');
const logger = require('../../utils/logger');

const pool = new Pool({
    host: config.database.host,
    port: config.database.port,
    database: config.database.name,
    user: config.database.user,
    password: config.database.password,
});

const updateSchema = async () => {
    try {
        console.log('Starting schema update for registration module...');

        await pool.query('BEGIN');

        // Update users table
        console.log('Updating users table...');
        await pool.query(`
            ALTER TABLE users 
            ADD COLUMN IF NOT EXISTS profile_photo VARCHAR(255);
        `);

        // Update organizations table
        console.log('Updating organizations table...');
        await pool.query(`
            ALTER TABLE organizations 
            ADD COLUMN IF NOT EXISTS license_document_url VARCHAR(255),
            DROP CONSTRAINT IF EXISTS organizations_status_check,
            ADD CONSTRAINT organizations_status_check CHECK (status IN ('active', 'inactive', 'pending', 'suspended', 'rejected'));
        `);

        // Update doctor_profiles table
        console.log('Updating doctor_profiles table...');
        await pool.query(`
            ALTER TABLE doctor_profiles 
            ADD COLUMN IF NOT EXISTS reg_year INTEGER,
            ADD COLUMN IF NOT EXISTS state_medical_council VARCHAR(255),
            ADD COLUMN IF NOT EXISTS degree_certificate_url VARCHAR(255),
            ADD COLUMN IF NOT EXISTS medical_reg_certificate_url VARCHAR(255);
        `);

        await pool.query('COMMIT');
        console.log('✅ Schema update completed successfully');
        process.exit(0);
    } catch (error) {
        await pool.query('ROLLBACK');
        console.error('❌ Schema update failed:', error);
        process.exit(1);
    }
};

updateSchema();
