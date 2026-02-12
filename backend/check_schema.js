const { Pool } = require('pg');
const config = require('./src/config/env');

const pool = new Pool({
    host: config.database.host,
    port: config.database.port,
    database: config.database.name,
    user: config.database.user,
    password: config.database.password,
});

const checkSchema = async () => {
    try {
        console.log('🔍 Checking users table schema...\n');

        const query = `
            SELECT column_name, data_type 
            FROM information_schema.columns 
            WHERE table_name = 'users';
        `;

        const result = await pool.query(query);
        console.table(result.rows);

        await pool.end();
    } catch (error) {
        console.error('Error:', error);
        await pool.end();
    }
};

checkSchema();
