require('dotenv').config();
const { Pool } = require('pg');

const pool = new Pool({
    user: process.env.DB_USER,
    host: process.env.DB_HOST,
    database: process.env.DB_NAME,
    password: process.env.DB_PASSWORD,
    port: process.env.DB_PORT,
});

async function fixConstraint() {
    try {
        console.log('Connecting to DB...');

        // 1. Drop existing constraint
        console.log('Dropping old constraint...');
        await pool.query(`
            ALTER TABLE visits 
            DROP CONSTRAINT IF EXISTS visits_status_check;
        `);
        console.log('Old constraint dropped.');

        // 2. Add new constraint with 'checked_in'
        console.log('Adding new constraint...');
        await pool.query(`
            ALTER TABLE visits 
            ADD CONSTRAINT visits_status_check 
            CHECK (status IN ('pending', 'approved', 'checked_in', 'in_progress', 'completed', 'cancelled'));
        `);
        console.log('New constraint added successfully.');

    } catch (err) {
        console.error('Error:', err);
    } finally {
        pool.end();
    }
}

fixConstraint();
