const { Pool } = require('pg');
const config = require('./src/config/env');

const pool = new Pool({
    host: config.database.host,
    port: config.database.port,
    database: config.database.name,
    user: config.database.user,
    password: config.database.password,
});

const updateEmail = async () => {
    try {
        console.log('🔄 Updating patient email...\n');

        // Update standard patient email
        const query1 = `
            UPDATE users 
            SET email = 'devanshdewan55@gmail.com' 
            WHERE email = 'patient@example.com';
        `;

        // Also check if there are other dummy emails and update them if needed 
        // (but be careful not to create duplicates if unique constraint exists)

        const result1 = await pool.query(query1);
        console.log(`Updated ${result1.rowCount} users from patient@example.com`);

        await pool.end();
    } catch (error) {
        console.error('Error:', error);
        await pool.end();
    }
};

updateEmail();
