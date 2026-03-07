const { Pool } = require('pg');
require('dotenv').config();

const pool = new Pool({
    host: process.env.DB_HOST || 'localhost',
    port: process.env.DB_PORT || 5432,
    database: process.env.DB_NAME || 'healthcare_db',
    user: process.env.DB_USER || 'postgres',
    password: String(process.env.DB_PASSWORD || ''),
});

async function explore() {
    try {
        // 1. Get IDs
        const p = await pool.query("SELECT id FROM users WHERE email = 'patient@example.com'");
        const d = await pool.query("SELECT u.id FROM users u JOIN roles r ON u.role_id = r.id WHERE r.name = 'doctor' LIMIT 1");

        console.log('--- IDs ---');
        console.log(JSON.stringify({
            patientId: p.rows[0]?.id,
            doctorId: d.rows[0]?.id
        }, null, 2));

        // 2. Check columns for relevant tables
        const tables = ['medical_records', 'diagnoses', 'prescriptions', 'lab_results'];
        console.log('\n--- Columns ---');
        for (const table of tables) {
            const colRes = await pool.query(`
        SELECT column_name, data_type, is_nullable
        FROM information_schema.columns
        WHERE table_name = $1
        ORDER BY ordinal_position
      `, [table]);
            console.log(`\nTable: ${table}`);
            colRes.rows.forEach(c => {
                console.log(` - ${c.column_name} (${c.data_type}, ${c.is_nullable === 'YES' ? 'NULL' : 'NOT NULL'})`);
            });
        }

    } catch (e) {
        console.error('Exploration error:', e);
    } finally {
        await pool.end();
    }
}

explore();
