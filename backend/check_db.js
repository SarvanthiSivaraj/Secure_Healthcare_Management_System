require('dotenv').config();
const { Pool } = require('pg');

const pool = new Pool({
    user: process.env.DB_USER,
    host: process.env.DB_HOST,
    database: process.env.DB_NAME,
    password: process.env.DB_PASSWORD,
    port: process.env.DB_PORT,
});

(async () => {
    try {
        console.log('Connecting to DB...');
        const res = await pool.query('SELECT * FROM visits LIMIT 1');
        const hasVisitCode = res.fields.some(f => f.name === 'visit_code');
        console.log('Has visit_code column:', hasVisitCode);
        console.log('All Columns:', res.fields.map(f => f.name).join(', '));
    } catch (err) {
        console.error('Error:', err);
    } finally {
        pool.end();
    }
})();
