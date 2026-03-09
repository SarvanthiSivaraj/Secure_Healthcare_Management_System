const { pool } = require('./src/config/db');
async function deleteJohn() {
    try {
        const res = await pool.query("DELETE FROM visits WHERE patient_id IN (SELECT id FROM users WHERE first_name='John' AND last_name='Doe') RETURNING id;");
        console.log("Deleted visits:", res.rows.length);
    } catch (e) { console.error(e); }
    process.exit(0);
}
deleteJohn();
