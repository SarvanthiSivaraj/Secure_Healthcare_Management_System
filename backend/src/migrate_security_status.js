const { pool } = require('./config/db');
require('dotenv').config();

async function migrate() {
    try {
        console.log('Adding status column to security_events...');
        await pool.query(`
            ALTER TABLE security_events 
            ADD COLUMN IF NOT EXISTS status VARCHAR(20) DEFAULT 'Open'
        `);
        console.log('Migration successful.');
        process.exit(0);
    } catch (err) {
        console.error('Migration failed:', err);
        process.exit(1);
    }
}

migrate();
