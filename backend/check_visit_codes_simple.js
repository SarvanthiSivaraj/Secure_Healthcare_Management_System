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
        result.rows.forEach(row => {
            console.log(`ID: ${row.id}`);
            console.log(`Visit Code: ${row.visit_code}`);
            console.log(`OTP Code: ${row.otp_code}`);
            console.log(`Status: ${row.status}`);
            console.log('-------------------');
        });

        await pool.end();
    } catch (error) {
        console.error('Error:', error);
        await pool.end();
    }
};

checkVisit();
