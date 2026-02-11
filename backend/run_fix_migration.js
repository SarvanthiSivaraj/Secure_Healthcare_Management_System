const { Pool } = require('pg');
const fs = require('fs');
const path = require('path');
const config = require('./src/config/env');

const pool = new Pool({
    host: config.database.host,
    port: config.database.port,
    database: config.database.name,
    user: config.database.user,
    password: config.database.password,
});

const runMigration = async () => {
    try {
        console.log('🔄 Running migration to fix visit status constraint...\n');

        const sqlPath = path.join(__dirname, 'src', 'database', 'migrations', 'fix_visit_status_constraint.sql');
        const sql = fs.readFileSync(sqlPath, 'utf8');

        await pool.query(sql);
        console.log('✅ Migration completed successfully!');

        await pool.end();
    } catch (error) {
        console.error('❌ Migration failed:', error);
        await pool.end();
    }
};

runMigration();
