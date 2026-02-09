require('dotenv').config();
const { query } = require('./src/config/db');
const bcrypt = require('bcrypt');
const { v4: uuidv4 } = require('uuid');

async function resetAdmin() {
    try {
        console.log('Starting admin reset...');
        
        // 1. Check/Create Role
        const roleRes = await query("SELECT id FROM roles WHERE name = 'hospital_admin'");
        let roleId;
        
        if (roleRes.rows.length === 0) {
            console.log('Creating hospital_admin role...');
            const newRole = await query("INSERT INTO roles (name, description) VALUES ('hospital_admin', 'Hospital Administrator') RETURNING id");
            roleId = newRole.rows[0].id;
        } else {
            roleId = roleRes.rows[0].id;
        }

        // 2. Encrypt Password
        const salt = await bcrypt.genSalt(12);
        const hashedPassword = await bcrypt.hash('Admin123!', salt);

        // 3. Upsert Admin User
        const email = 'hosp_admin@healthcare.com';
        const userRes = await query("SELECT id FROM users WHERE email = $1", [email]);

        if (userRes.rows.length > 0) {
            console.log('Updating existing admin user...');
            await query(`
                UPDATE users 
                SET password_hash = $1, role_id = $2, is_verified = true, status = 'active'
                WHERE email = $3
            `, [hashedPassword, roleId, email]);
        } else {
            console.log('Creating new admin user...');
            await query(`
                INSERT INTO users (email, password_hash, role_id, is_verified, status, first_name, last_name)
                VALUES ($1, $2, $3, true, 'active', 'Hospital', 'Admin')
            `, [email, hashedPassword, roleId]);
        }

        console.log('Admin user reset successfully.');
        console.log('Email: hosp_admin@healthcare.com');
        console.log('Password: Admin123!');
        process.exit(0);

    } catch (err) {
        console.error('Error resetting admin:', err);
        process.exit(1);
    }
}

resetAdmin();
