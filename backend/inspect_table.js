const { Pool } = require('pg');
const config = require('./src/config/env');

const pool = new Pool({
    host: config.database.host,
    port: config.database.port,
    database: config.database.name,
    user: config.database.user,
    password: config.database.password,
});

const inspect = async () => {
    try {
        const res = await pool.query(`
            SELECT column_name, data_type, is_nullable, character_maximum_length
            FROM information_schema.columns
            WHERE table_name = 'organizations';
        `);
        console.log('Organizations Table Columns:');
        console.log(JSON.stringify(res.rows, null, 2));
    } catch (err) {
        console.error(err);
    } finally {
        pool.end();
    }
};

inspect();
