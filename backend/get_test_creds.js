const { Pool } = require('pg');
require('dotenv').config();

const pool = new Pool({
    user: process.env.DB_USER || 'postgres',
    host: process.env.DB_HOST || 'localhost',
    database: process.env.DB_NAME || 'healthcare_system',
    password: process.env.DB_PASSWORD || 'postgres',
    port: process.env.DB_PORT || 5432,
});

async function getCreds() {
    try {
        const rolesToTest = [
            'patient',
            'doctor',
            'system_admin',
            'pharmacist',
            'nurse',
            'radiologist',
            'receptionist'
        ];

        console.log("=== Valid Test Accounts in Database ===");

        for (const roleName of rolesToTest) {
            const userRes = await pool.query(`
                SELECT u.email, u.status, u.is_verified, r.name as role 
                FROM users u 
                JOIN roles r ON u.role_id = r.id 
                WHERE r.name = $1 AND u.status = 'active'
                LIMIT 1
            `, [roleName]);

            if (userRes.rows.length > 0) {
                const u = userRes.rows[0];
                console.log(`Role: ${u.role.padEnd(15)} | Email: ${u.email}`);
            } else {
                console.log(`Role: ${roleName.padEnd(15)} | (No active users found)`);
            }
        }

    } catch (e) {
        console.error("DB Error:", e.message);
    } finally {
        await pool.end();
    }
}

getCreds();
