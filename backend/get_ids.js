const pool = require('./src/config/db');

async function getIds() {
    try {
        const p = await pool.query("SELECT id FROM users WHERE email = 'patient@example.com'");
        const d = await pool.query("SELECT id FROM users WHERE role = 'doctor' LIMIT 1");
        // If no explicit 'doctor' role, try finding one by checking roles table
        let doctorId = d.rows[0]?.id;
        if (!doctorId) {
            const d2 = await pool.query("SELECT u.id FROM users u JOIN roles r ON u.role_id = r.id WHERE r.name = 'doctor' LIMIT 1");
            doctorId = d2.rows[0]?.id;
        }
        console.log(JSON.stringify({
            patientId: p.rows[0]?.id,
            doctorId: doctorId
        }));
    } catch (e) {
        console.error(e);
    } finally {
        await pool.end();
    }
}

getIds();
