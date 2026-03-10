require('dotenv').config();
const { pool } = require('./config/db');
const bcrypt = require('bcrypt');
const { v4: uuidv4 } = require('uuid');

async function createInsuranceOfficer() {
    try {
        console.log('Connecting to database...');

        // 1. Ensure the role exists
        const roleResult = await pool.query(`SELECT id FROM roles WHERE name = 'insurance_provider'`);
        let roleId;

        if (roleResult.rows.length === 0) {
            console.log('Creating insurance_provider role...');
            const newRole = await pool.query(
                `INSERT INTO roles (id, name, description) VALUES ($1, $2, $3) RETURNING id`,
                [uuidv4(), 'insurance_provider', 'Insurance Provider / Officer']
            );
            roleId = newRole.rows[0].id;
        } else {
            roleId = roleResult.rows[0].id;
            console.log('Found insurance_provider role:', roleId);
        }

        // 2. Check if user already exists
        const email = 'insurance@medicare.com';
        const userExists = await pool.query(`SELECT id FROM users WHERE email = $1`, [email]);

        if (userExists.rows.length > 0) {
            console.log('User already exists with email:', email);
            console.log('You can log in with:');
            console.log('Email:', email);
            console.log('Password: password123');
            return;
        }

        // 3. Create the user
        const hashedPassword = await bcrypt.hash('password123', 10);
        const userId = uuidv4();

        await pool.query(
            `INSERT INTO users (id, email, password_hash, first_name, last_name, phone, role_id, is_verified, status) 
             VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)`,
            [
                userId,
                email,
                hashedPassword,
                'Sarah',
                'Jenkins',
                '+1 555-0100',
                roleId,
                true,
                'active'
            ]
        );

        console.log('Successfully created Insurance Officer!');
        console.log('----------------------------------------');
        console.log('Login Credentials:');
        console.log(`Email: ${email}`);
        console.log(`Password: password123`);
        console.log('----------------------------------------');

    } catch (error) {
        console.error('Error creating insurance officer:', error);
    } finally {
        await pool.end();
        process.exit(0);
    }
}

createInsuranceOfficer();
