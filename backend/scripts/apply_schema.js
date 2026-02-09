const { Pool } = require('pg');
const config = require('../src/config/env');

const pool = new Pool({
    host: config.database.host,
    port: config.database.port,
    database: config.database.name,
    user: config.database.user,
    password: config.database.password,
});

const createTableQuery = `
-- ============================================
-- DOCTOR_PROFILES TABLE
-- ============================================
CREATE TABLE IF NOT EXISTS doctor_profiles (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES users(id) ON DELETE CASCADE UNIQUE NOT NULL,
    specialization VARCHAR(100) NOT NULL,
    license_number VARCHAR(100) UNIQUE NOT NULL,
    experience_years INTEGER,
    bio TEXT,
    consultation_fee DECIMAL(10, 2),
    availability JSONB, -- { "monday": ["09:00-12:00", "14:00-17:00"], ... }
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_doctor_profiles_user ON doctor_profiles(user_id);
CREATE INDEX IF NOT EXISTS idx_doctor_profiles_specialization ON doctor_profiles(specialization);
`;

const applySchema = async () => {
    try {
        console.log('Applying schema update...');
        await pool.query(createTableQuery);
        console.log('✅ doctor_profiles table created successfully.');
        process.exit(0);
    } catch (error) {
        console.error('❌ Failed to apply schema update:', error);
        process.exit(1);
    }
};

applySchema();
