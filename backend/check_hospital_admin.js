const { Pool } = require('pg');
const config = require('./src/config/env');

const pool = new Pool({
    host: config.database.host,
    port: config.database.port,
    database: config.database.name,
    user: config.database.user,
    password: config.database.password,
});

const checkUser = async () => {
    try {
        const result = await pool.query(`
            SELECT u.id, u.email, u.first_name, u.last_name, r.name as role_name, u.is_verified, u.status
            FROM users u
            JOIN roles r ON u.role_id = r.id
            WHERE u.email = 'admin@hospital.com'
        `);

        if (result.rows.length === 0) {
            console.log('❌ User not found!');
        } else {
            const user = result.rows[0];
            console.log('✅ User found:');
            console.log(JSON.stringify(user, null, 2));
        }

        await pool.end();
    } catch (error) {
        console.error('Error:', error);
        await pool.end();
    }
};

checkUser();
