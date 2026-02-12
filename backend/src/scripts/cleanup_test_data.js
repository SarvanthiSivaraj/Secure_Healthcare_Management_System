const { Pool } = require('pg');
const config = require('../config/env');

const pool = new Pool({
    host: config.database.host,
    port: config.database.port,
    database: config.database.name,
    user: config.database.user,
    password: config.database.password,
});

const cleanup = async () => {
    try {
        console.log('🧹 Cleaning up test visits...');
        const res = await pool.query("DELETE FROM visits WHERE reason = 'Audit Test' OR reason = 'Test Visit'");
        console.log(`✅ Deleted ${res.rowCount} test visits.`);
        process.exit(0);
    } catch (error) {
        console.error('❌ Cleanup failed:', error);
        process.exit(1);
    }
};

cleanup();
