const fs = require('fs');
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, 'backend', '.env') });
const { query } = require(path.join(__dirname, 'backend', 'src', 'config', 'db'));

async function runMigration() {
    try {
        const sqlPath = path.join(__dirname, 'backend', 'src', 'database', 'migrations', 'add_nurse_profile_fields.sql');
        const sql = fs.readFileSync(sqlPath, 'utf8');

        console.log('Running migration...');
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
