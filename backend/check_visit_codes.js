const { Pool } = require('pg');
const config = require('./src/config/env');

const pool = new Pool({
    host: config.database.host,
    port: config.database.port,
    database: config.database.name,
    user: config.database.user,
    password: config.database.password,
});

const checkVisit = async () => {
    try {
        console.log('🔍 Checking visit codes in database...\n');

        const query = `
            SELECT id, visit_code, otp_code, status 
            FROM visits 
            ORDER BY created_at DESC 
            LIMIT 5
        `;

        const result = await pool.query(query);
        console.log('Recent Visits:');
        console.table(result.rows);

        await pool.end();
    } catch (error) {
        console.error('Error:', error);
        await pool.end();
    }
};

checkVisit();
