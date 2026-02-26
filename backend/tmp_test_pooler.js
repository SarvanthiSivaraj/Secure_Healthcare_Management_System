const { Pool } = require('pg');

const pool = new Pool({
    host: 'aws-0-ap-south-1.pooler.supabase.com',
    port: 6543,
    database: 'postgres',
    user: 'postgres.dfahfdiuhwjyckdziyxo',
    password: 'Bfbubb3amGy3HQ91', // From the user's .env
    ssl: { rejectUnauthorized: false }
});

console.log('Testing connection via pooler (ap-south-1)...');

pool.query('SELECT NOW()', (err, res) => {
    if (err) {
        console.error('Connection failed:', err.message);
    } else {
        console.log('Connection successful:', res.rows[0]);
    }
    pool.end();
});
