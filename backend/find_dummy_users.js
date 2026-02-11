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
        console.log('🔍 Checking users with dummy emails...\n');

        const query = `
            SELECT id, email, first_name, last_name, role_name
            FROM users 
            WHERE email LIKE '%example.com%' OR email LIKE '%test%';
        `;

        // Note: 'role_name' might be the column name if 'role' wasn't there?
        // Let's try to just select * to see what columns we have if we fail, 
        // but 'email' is definitely there.

        // Actually, let's just select email and id to be safe.
        const safeQuery = `
            SELECT id, email, first_name, last_name
            FROM users 
            WHERE email LIKE '%example.com%' OR email LIKE '%test%';
        `;

        const result = await pool.query(safeQuery);
        console.table(result.rows);

        await pool.end();
    } catch (error) {
        console.error('Error:', error);
        await pool.end();
    }
};

checkUsers();
