require('dotenv').config();
const { pool } = require('./config/db');
const bcrypt = require('bcrypt');
const { v4: uuidv4 } = require('uuid');

async function setupComplianceOfficer() {
    try {
        console.log('Connecting to database...');

        // 1. Get role ID
        const roleResult = await pool.query(`SELECT id FROM roles WHERE name = 'compliance_officer'`);
        if (roleResult.rows.length === 0) {
            console.log('Role compliance_officer not found!');
            return;
        }
        const roleId = roleResult.rows[0].id;

        const email = 'compliance@medicare.com';

        // 2. Check if user already exists
        const userExists = await pool.query(`SELECT id FROM users WHERE email = $1`, [email]);

        const hashedPassword = await bcrypt.hash('password123', 10);

        if (userExists.rows.length > 0) {
            console.log('User already exists, updating password...');
            await pool.query(
                `UPDATE users SET password_hash = $1 WHERE email = $2`,
                [hashedPassword, email]
            );
        } else {
            console.log('Creating new compliance officer...');
            await pool.query(
                `INSERT INTO users (id, email, password_hash, first_name, last_name, phone, role_id, is_verified, status) 
                 VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)`,
                [uuidv4(), email, hashedPassword, 'John', 'Compliance', '+1 555-0999', roleId, true, 'active']
            );
        }

        console.log('----------------------------------------');
        console.log('Compliance Officer Credentials:');
        console.log(`Email: ${email}`);
        console.log(`Password: password123`);
        console.log('----------------------------------------');

    } catch (error) {
        console.error('Error:', error);
    } finally {
        await pool.end();
        process.exit(0);
    }
}

setupComplianceOfficer();
