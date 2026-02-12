const axios = require('axios');
const { Pool } = require('pg');
const config = require('./src/config/env');

const pool = new Pool({
    host: config.database.host,
    port: config.database.port,
    database: config.database.name,
    user: config.database.user,
    password: config.database.password,
});

const testCheckIn = async () => {
    try {
        console.log('🧪 Testing Visit Check-In...\n');

        // Step 1: Get the latest visit code
        const visitResult = await pool.query('SELECT visit_code, patient_id FROM visits WHERE status = \'approved\' ORDER BY created_at DESC LIMIT 1');
        if (visitResult.rows.length === 0) {
            console.log('⚠️ No approved visits found to test check-in');
            await pool.end();
            return;
        }

        const visitCode = visitResult.rows[0].visit_code;
        const patientId = visitResult.rows[0].patient_id;
        console.log(`📋 Found approved visit code: ${visitCode} (Patient ID: ${patientId})\n`);

        // Step 2: Get patient email/password to login
        const userResult = await pool.query('SELECT email FROM users WHERE id = $1', [patientId]);
        const email = userResult.rows[0].email;
        console.log(`👤 Patient Email: ${email}`);

        // Note: Assuming default password or we need to know it. 
        // If we don't know the password, we can't login as this patient.
        // Let's try sticking to the admin user to verify valid code first, 
        // BUT checkInVisit requires user to be the owner of the visit.

        // WORKAROUND: Create a temporary token or mock login for this patient? 
        // Better: Reset password for this patient to a known value to login

        console.log('🔄 Resetting patient password to "Password@123" for testing...');
        // We need to hash the password properly if we update it, 
        // but let's try to login with a known user if the patient is "John Doe" (test user).

        // Actually, let's just create a NEW visit for a known user (patient@hospital.com / Patient@123)
        // and then approve it and then check in. This is cleaner.

        await pool.end();

    } catch (error) {
        console.error('Error:', error);
        await pool.end();
    }
};

// Simplified test: Just try to call check-in with the code we have, 
// using the patient token if we can get it.
// If we created this visit with "John Doe", we need his credentials.

// Let's verify who the patient is for visit code 465739
const verifyPatient = async () => {
    try {
        const visitCode = '465739';
        console.log(`🔍 Verifying patient for visit code ${visitCode}...\n`);

        const query = `
            SELECT v.id, v.patient_id, u.first_name, u.last_name, u.email 
            FROM visits v
            JOIN users u ON v.patient_id = u.id
            WHERE v.visit_code = $1
        `;

        const result = await pool.query(query, [visitCode]);
        if (result.rows.length > 0) {
            console.log('👤 Patient Details:');
            console.log(result.rows[0]);
        } else {
            console.log('❌ Visit not found');
        }
        await pool.end();
    } catch (error) {
        console.error(error);
        await pool.end();
    }
}

verifyPatient();
