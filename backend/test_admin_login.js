require('dotenv').config();
const { query } = require('./src/config/db');
const bcrypt = require('bcrypt');

async function testAdminLogin() {
    try {
        console.log('Testing admin login credentials...\n');
        
        const email = 'hosp_admin@healthcare.com';
        const password = 'Admin123!';
        
        // Get user from database
        const result = await query(`
            SELECT u.*, r.name as role_name
            FROM users u
            LEFT JOIN roles r ON u.role_id = r.id
            WHERE u.email = $1
        `, [email]);

        if (result.rows.length === 0) {
            console.log('❌ User NOT found in database!');
            process.exit(1);
        }

        const user = result.rows[0];
        console.log('✅ User found in database:');
        console.log('   Email:', user.email);
        console.log('   Role:', user.role_name);
        console.log('   Status:', user.status);
        console.log('   Is Verified:', user.is_verified);
        console.log('   User ID:', user.id);
        console.log('');

        // Test password
        const isValid = await bcrypt.compare(password, user.password_hash);
        
        if (isValid) {
            console.log('✅ Password is CORRECT!');
            console.log('');
            console.log('USE THESE CREDENTIALS:');
            console.log('   Email: hosp_admin@healthcare.com');
            console.log('   Password: Admin123!');
        } else {
            console.log('❌ Password is INCORRECT!');
            console.log('   The password in the database does not match "Admin123!"');
        }

        process.exit(0);

    } catch (err) {
        console.error('Error:', err);
        process.exit(1);
    }
}

testAdminLogin();
