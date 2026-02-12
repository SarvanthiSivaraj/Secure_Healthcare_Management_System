const { Pool } = require('pg');
const config = require('./src/config/env');

const pool = new Pool({
    host: config.database.host,
    port: config.database.port,
    database: config.database.name,
    user: config.database.user,
    password: config.database.password,
});

const checkDoctorsAndNurses = async () => {
    try {
        console.log('🔍 Checking for doctors and nurses...\n');

        // Check doctors
        const doctorsQuery = `
            SELECT u.id, u.first_name, u.last_name, u.email, r.name as role_name
            FROM users u
            JOIN roles r ON u.role_id = r.id
            WHERE r.name = 'doctor'
        `;
        const doctorsResult = await pool.query(doctorsQuery);
        console.log(`👨‍⚕️ Found ${doctorsResult.rows.length} doctor(s):`);
        doctorsResult.rows.forEach(doc => {
            console.log(`   - ${doc.first_name} ${doc.last_name} (ID: ${doc.id}, Email: ${doc.email})`);
        });

        // Check nurses
        const nursesQuery = `
            SELECT u.id, u.first_name, u.last_name, u.email, r.name as role_name
            FROM users u
            JOIN roles r ON u.role_id = r.id
            WHERE r.name = 'nurse'
        `;
        const nursesResult = await pool.query(nursesQuery);
        console.log(`\n👩‍⚕️ Found ${nursesResult.rows.length} nurse(s):`);
        nursesResult.rows.forEach(nurse => {
            console.log(`   - ${nurse.first_name} ${nurse.last_name} (ID: ${nurse.id}, Email: ${nurse.email})`);
        });

        await pool.end();
    } catch (error) {
        console.error('Error:', error);
        await pool.end();
    }
};

checkDoctorsAndNurses();
