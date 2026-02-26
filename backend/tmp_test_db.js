const { Pool } = require('pg');
require('dotenv').config({ path: 'C:/Users/srsar/Desktop/SE/Secure_Healthcare_Management_System/backend/.env' });

console.log('Testing connection to:', process.env.DB_HOST);

const pool = new Pool({
    host: process.env.DB_HOST,
    port: process.env.DB_PORT,
    database: process.env.DB_NAME,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    ssl: { rejectUnauthorized: false }
});

pool.query('SELECT NOW()', (err, res) => {
    if (err) {
        console.error('Connection failed:', err.message);
    } else {
        console.log('Connection successful:', res.rows[0]);
    }
    pool.end();
});
