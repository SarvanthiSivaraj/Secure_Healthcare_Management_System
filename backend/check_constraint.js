const { Pool } = require('pg');
const config = require('./src/config/env');

const pool = new Pool({
    host: config.database.host,
    port: config.database.port,
    database: config.database.name,
    user: config.database.user,
    password: config.database.password,
});

const checkConstraint = async () => {
    try {
        console.log('🔍 Checking visits_status_check constraint...\n');

        const query = `
            SELECT pg_get_constraintdef(oid) AS constraint_def
            FROM pg_constraint
            WHERE conname = 'visits_status_check';
        `;

        const result = await pool.query(query);
        if (result.rows.length > 0) {
            console.log('Constraint Definition:');
            console.log(result.rows[0].constraint_def);
        } else {
            console.log('❌ Constraint not found');
        }

        await pool.end();
    } catch (error) {
        console.error('Error:', error);
        await pool.end();
    }
};

checkConstraint();
