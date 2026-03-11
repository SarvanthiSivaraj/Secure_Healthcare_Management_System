require('dotenv').config();
const { Pool } = require('pg');
const fs = require('fs');

const pool = new Pool({
    host: process.env.DB_HOST || 'localhost',
    port: process.env.DB_PORT || 5432,
    database: process.env.DB_NAME || 'healthcare_db',
    user: process.env.DB_USER || 'postgres',
    password: process.env.DB_PASSWORD || 'postgres',
    ssl: process.env.DB_HOST && !process.env.DB_HOST.includes('localhost') ? { rejectUnauthorized: false } : false,
});

async function survey() {
    try {
        let output = `Connection: ${process.env.DB_HOST} / ${process.env.DB_NAME}\n`;

        const tablesRes = await pool.query(`
            SELECT table_name 
            FROM information_schema.tables 
            WHERE table_schema = 'public'
        `);
        output += 'Tables in public: ' + tablesRes.rows.map(r => r.table_name).join(', ') + '\n';

        const userCount = await pool.query('SELECT count(*) FROM users');
        output += 'User count: ' + userCount.rows[0].count + '\n';

        const roles = await pool.query('SELECT name FROM roles');
        output += 'Roles: ' + roles.rows.map(r => r.name).join(', ') + '\n';

        const samples = await pool.query(`
            SELECT u.email, r.name as role 
            FROM users u 
            JOIN roles r ON u.role_id = r.id 
            LIMIT 100
        `);
        output += 'Users List:\n';
        samples.rows.forEach(u => {
            output += `Role: ${u.role.padEnd(20)} | Email: ${u.email}\n`;
        });

        fs.writeFileSync('db_survey_results.txt', output, 'utf8');
        console.log('Results written to db_survey_results.txt');

    } catch (err) {
        console.error('Survey failed:', err.message);
    } finally {
        await pool.end();
    }
}

survey();
