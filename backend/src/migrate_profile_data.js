require('dotenv').config();
const { pool } = require('./config/db');

async function migrateProfile() {
    try {
        console.log('--- Migrating User Table for Profile Address ---');

        // 1. Add address column to users table
        await pool.query(`
            ALTER TABLE users 
            ADD COLUMN IF NOT EXISTS address TEXT
        `);
        console.log('✅ Added address column to users table');

        // 2. Update the compliance officer with real details
        // We identify the officer by email
        await pool.query(`
            UPDATE users 
            SET phone = '+1 (555) 098-7721', 
                address = '123 Security Plaza, Information Governance Dept, Metropolis, NY 10101',
                status = 'active'
            WHERE email = 'compliance@medicare.com'
        `);
        console.log('✅ Updated compliance officer with demo details');

        console.log('--- Migration Complete ---');
        process.exit(0);
    } catch (err) {
        console.error('❌ Migration failed:', err);
        process.exit(1);
    }
}

migrateProfile();
