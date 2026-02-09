const { Pool } = require('pg');
const config = require('../config/env');

const pool = new Pool({
    host: config.database.host,
    port: config.database.port,
    database: config.database.name,
    user: config.database.user,
    password: config.database.password,
});

const checkData = async () => {
    try {
        console.log('Checking for user mytest@patient.com...');
        const userRes = await pool.query("SELECT * FROM users WHERE email = 'mytest@patient.com'");
        
        if (userRes.rows.length === 0) {
            console.log('❌ User not found!');
            return;
        }
        
        const user = userRes.rows[0];
        console.log('✅ User found:', { id: user.id, email: user.email, role_id: user.role_id });

        const profileRes = await pool.query("SELECT * FROM patient_profiles WHERE user_id = $1", [user.id]);
        
        if (profileRes.rows.length === 0) {
            console.log('❌ Patient profile NOT found for this user!');
        } else {
            console.log('✅ Patient profile found:', profileRes.rows[0]);
        }
        
    } catch (error) {
        console.error('Error:', error);
    } finally {
        pool.end();
    }
};

checkData();
