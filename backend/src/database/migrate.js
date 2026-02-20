const { Pool } = require('pg');
const fs = require('fs');
const path = require('path');
const config = require('../config/env');
const logger = require('../utils/logger');

const pool = new Pool({
    host: config.database.host,
    port: config.database.port,
    database: config.database.name,
    user: config.database.user,
    password: config.database.password,
});

const ensureOrganizationHospitalCode = async () => {
    await pool.query(`
        ALTER TABLE organizations
        ADD COLUMN IF NOT EXISTS hospital_code VARCHAR(6)
    `);

    await pool.query(`
        UPDATE organizations
        SET hospital_code = LPAD((100000 + FLOOR(RANDOM() * 900000))::text, 6, '0')
        WHERE hospital_code IS NULL
    `);

    await pool.query(`
        DO $$
        BEGIN
            IF NOT EXISTS (
                SELECT 1
                FROM pg_constraint
                WHERE conname = 'unique_hospital_code'
            ) THEN
                ALTER TABLE organizations
                ADD CONSTRAINT unique_hospital_code UNIQUE (hospital_code);
            END IF;
        END $$
    `);
};

/**
 * Run database migrations
 */
const migrate = async () => {
    try {
        logger.info('Starting database migration...');

        // Read schema file
        const schemaPath = path.join(__dirname, 'schema.sql');
        const schema = fs.readFileSync(schemaPath, 'utf8');

        // Execute schema
        await pool.query(schema);

        // Repair schema drift for organizations.hospital_code used by seed/auth/visit flows
        await ensureOrganizationHospitalCode();

        logger.info('✅ Database migration completed successfully');
        process.exit(0);
    } catch (error) {
        logger.error('❌ Database migration failed:', error);
        process.exit(1);
    }
};

// Run migration if this file is executed directly
if (require.main === module) {
    migrate();
}

module.exports = { migrate };
