const path = require('path');
require('dotenv').config({ path: path.join(__dirname, 'backend', '.env') });
const { query } = require(path.join(__dirname, 'backend', 'src', 'config', 'db'));

async function checkSchema() {
    try {
        console.log('--- Tables ---');
        const tables = await query("SELECT table_name FROM information_schema.tables WHERE table_schema = 'public'");
        console.log(tables.rows.map(r => r.table_name).join(', '));

        const targets = ['users', 'staff_org_mapping', 'patient_profiles', 'doctor_profiles'];
        for (const table of targets) {
            console.log(`\n--- Columns for ${table} ---`);
            const columns = await query(`SELECT column_name FROM information_schema.columns WHERE table_name = '${table}'`);
            console.log(columns.rows.map(r => r.column_name).join(', '));
        }
    } catch (err) {
        console.error('Error checking schema:', err.message);
    } finally {
        process.exit();
    }
}

checkSchema();
