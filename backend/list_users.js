const { Client } = require('pg');
require('dotenv').config({ path: '../.env' });

const client = new Client({
    host: process.env.DB_HOST || 'localhost',
    port: process.env.DB_PORT || 5432,
    database: process.env.DB_NAME || 'healthcare_db',
    user: process.env.DB_USER || 'HarishGM',
    password: process.env.DB_PASSWORD || '123456',
});

async function getUsers() {
    try {
        await client.connect();
        
        const query = `
            SELECT u.id, u.email, u.first_name, u.last_name, r.name as role, u.password
            FROM users u
            JOIN roles r ON u.role_id = r.id
            ORDER BY r.name, u.email;
        `;
        
        const res = await client.query(query);
        console.table(res.rows.map(r => ({
            ...r,
            password: r.password.substring(0, 10) + '...' // Truncate hash
        })));
        
    } catch (err) {
        console.error('Error:', err);
    } finally {
        await client.end();
    }
}

getUsers();
