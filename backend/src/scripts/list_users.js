const { Pool } = require('pg');
const config = require('../config/env');

const pool = new Pool({
    host: config.database.host,
    port: config.database.port,
    database: config.database.name,
    user: config.database.user,
    password: config.database.password,
});

const listUsers = async () => {
    try {
        console.log('Listing all users...');
        const userRes = await pool.query("SELECT id, email, first_name, last_name, role_id FROM users");
        
        console.log(`Found ${userRes.rows.length} users:`);
        userRes.rows.forEach(u => console.log(` - ${u.email} (ID: ${u.id})`));

        if (userRes.rows.length > 0) {
             const profiles = await pool.query("SELECT * FROM patient_profiles");
             console.log(`\nFound ${profiles.rows.length} patient profiles:`);
             profiles.rows.forEach(p => console.log(` - UserID: ${p.user_id}, HealthID: ${p.unique_health_id}`));
        }
        
    } catch (error) {
        console.error('Error:', error);
    } finally {
        pool.end();
    }
};

listUsers();
