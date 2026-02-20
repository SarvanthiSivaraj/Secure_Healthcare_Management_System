const { Pool } = require('pg');
const fs = require('fs');
const path = require('path');
require('dotenv').config();

const pool = new Pool({
    host: process.env.DB_HOST || 'localhost',
    port: parseInt(process.env.DB_PORT) || 5432,
    database: process.env.DB_NAME || 'healthcare_db',
    user: process.env.DB_USER || 'postgres',
    password: process.env.DB_PASSWORD,
});

async function runFix() {
    try {
        console.log('⏳ Running passkey_credentials migration...');
        const sqlPath = path.join(__dirname, 'src', 'database', 'migrations', 'add_passkey_credentials.sql');
        const sql = fs.readFileSync(sqlPath, 'utf8');

        await pool.query(sql);
        console.log('✅ Migration completed successfully!');

        // Double check table existence
        const checkRes = await pool.query("SELECT EXISTS (SELECT FROM information_schema.tables WHERE table_name = 'passkey_credentials')");
        if (checkRes.rows[0].exists) {
            console.log('✅ Verified: passkey_credentials table now exists.');
        } else {
            console.error('❌ Failed to verify table existence.');
        }
    } catch (error) {
        console.error('❌ Migration failed:', error.message);
    } finally {
        await pool.end();
        process.exit();
    }
}

runFix();
