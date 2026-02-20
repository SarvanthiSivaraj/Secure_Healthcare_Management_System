const { Pool } = require('pg');
const config = require('./src/config/env');

const pool = new Pool({
    host: config.database.host,
    port: config.database.port,
    database: config.database.name,
    user: config.database.user,
    password: config.database.password,
});

const debugOrg = async () => {
    try {
        console.log('Attempting to insert organization...');
        const orgRes = await pool.query(
            `INSERT INTO organizations (name, type, license_number, status, email, phone, address, hospital_code)
             VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
             ON CONFLICT (license_number) DO UPDATE SET status = 'active'
             RETURNING id`,
            ['General Hospital', 'hospital', 'ORG-001', 'active', 'info@generalhospital.com', '555-0123', '123 Health St', 'HO-0001']
        );
        console.log('✅ Organization seeded:', orgRes.rows[0].id);
    } catch (err) {
        console.error('❌ Organization seeding failed!');
        console.error('Error Code:', err.code);
        console.error('Error Message:', err.message);
        console.error('Error Detail:', err.detail);
        console.error('Error Hint:', err.hint);
    } finally {
        pool.end();
    }
};

debugOrg();
