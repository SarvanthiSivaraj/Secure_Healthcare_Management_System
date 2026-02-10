const { Pool } = require('pg');
const fs = require('fs');
const path = require('path');
require('dotenv').config();

const pool = new Pool({
    host: process.env.DB_HOST,
    port: process.env.DB_PORT,
    database: process.env.DB_NAME,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
});

async function runMigrations() {
    try {
        console.log('Running pending migrations...');

        const files = [
            'add_visit_management_fixed.sql',
            'add_visit_otp_access_level.sql'
        ];

        for (const file of files) {
            const filePath = path.join(__dirname, 'src/database/migrations', file);
            if (fs.existsSync(filePath)) {
                console.log(`Executing ${file}...`);
                const sql = fs.readFileSync(filePath, 'utf8');
                await pool.query(sql);
                console.log(`✅ ${file} executed successfully.`);
            } else {
                console.error(`❌ File not found: ${filePath}`);
            }
        }

        console.log('All migrations completed.');
    } catch (err) {
        console.error('Migration failed:', err);
    } finally {
        pool.end();
    }
}

runMigrations();
