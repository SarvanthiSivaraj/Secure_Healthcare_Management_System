const fs = require('fs');
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '..', '..', '.env') });
const { query } = require(path.join(__dirname, '..', 'config', 'db'));

async function runMigration() {
    try {
        const sqlPath = path.join(__dirname, '..', 'database', 'migrations', 'add_nurse_profile_fields.sql');
        const sql = fs.readFileSync(sqlPath, 'utf8');

        console.log('Running migration...');
        // Split by semicolon and run separately to handle multiple statements if needed, 
        // but query() handles multiple statements usually.
        await query(sql);
        console.log('Migration completed successfully!');
    } catch (err) {
        console.error('Migration failed:', err.message);
        process.exit(1);
    } finally {
        process.exit();
    }
}

runMigration();
