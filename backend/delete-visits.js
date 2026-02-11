// Quick script to delete all visits from database
require('dotenv').config();
const { pool } = require('./src/config/db');

async function deleteAllVisits() {
    try {
        const result = await pool.query('DELETE FROM visits');
        console.log(`✅ Successfully deleted ${result.rowCount} visit(s)`);
        await pool.end();
        process.exit(0);
    } catch (error) {
        console.error('❌ Error deleting visits:', error.message);
        await pool.end();
        process.exit(1);
    }
}

deleteAllVisits();
