const { Pool } = require('pg');
const config = require('./src/config/env');

const pool = new Pool({
    host: config.database.host,
    port: config.database.port,
    database: config.database.name,
    user: config.database.user,
    password: config.database.password,
});

const checkUsers = async () => {
    try {
        console.log('🔍 Checking users in database...\n');

        const query = `
            SELECT id, first_name, last_name, email, role 
            FROM users 
            WHERE role = 'patient' OR email LIKE '%example.com%' OR email LIKE '%gmail.com%'
        `;

        const result = await pool.query(query);
        console.table(result.rows);

        await pool.end();
    } catch (error) {
        console.error('Error:', error);
        await pool.end();
    }
};

checkUsers();
