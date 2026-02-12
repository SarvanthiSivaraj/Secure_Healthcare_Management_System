const { query } = require('../config/db');
const logger = require('../utils/logger');

async function checkRoles() {
    try {
        console.log('Checking roles table schema...');
        const rolesSchema = await query(`
            SELECT column_name, data_type 
            FROM information_schema.columns 
            WHERE table_name = 'roles';
        `);
        console.log('Roles Table Columns:', rolesSchema.rows);

        console.log('Checking users table schema...');
        const usersSchema = await query(`
            SELECT column_name, data_type 
            FROM information_schema.columns 
            WHERE table_name = 'users';
        `);
        console.log('Users Table Columns:', usersSchema.rows);

        console.log('Checking existing roles...');
        const roles = await query('SELECT * FROM roles');
        console.log('Roles Data:', roles.rows);

        console.log('Checking user and their roles...');
        // Try to join users and roles based on standard convention
        // Adjust if schema is different based on above output
        const users = await query(`
            SELECT u.id, u.email, u.role_id, r.name as role_name, r.id as r_id 
            FROM users u 
            LEFT JOIN roles r ON u.role_id = r.id
        `);
        console.log('Users with joined Roles:', users.rows);

    } catch (error) {
        console.error('Error checking roles:', error);
    } finally {
        process.exit();
    }
}

checkRoles();
