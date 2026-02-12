const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '.env') });
const { Pool } = require('pg');
const config = require('./src/config/env');

const pool = new Pool({
    host: config.database.host,
    port: config.database.port,
    database: config.database.name,
    user: config.database.user,
    password: config.database.password,
});

const verifyPatientVisits = async () => {
    try {
        console.log('🧪 Verifying Patient Visits Logic...\n');

        // 1. Find a patient with visits
        const patientQuery = `
            SELECT v.patient_id, u.first_name, u.email, COUNT(v.id) as visit_count
            FROM visits v
            JOIN users u ON v.patient_id = u.id
            GROUP BY v.patient_id, u.first_name, u.email
            LIMIT 1
        `;

        const patientRes = await pool.query(patientQuery);

        if (patientRes.rows.length === 0) {
            console.log('⚠️ No patients with visits found.');
            await pool.end();
            return;
        }

        const patient = patientRes.rows[0];
        console.log(`👤 Found Patient: ${patient.first_name} (${patient.email})`);
        console.log(`📊 Total Visits in DB: ${patient.visit_count}\n`);

        // 2. Fetch visits using the exact query logic from VisitModel.findByPatientId
        console.log('🔄 Executing VisitModel logic...');

        const visitQuery = `
            SELECT v.*,
            u.first_name as doctor_first_name,
            u.last_name as doctor_last_name,
            o.name as hospital_name
            FROM visits v
            LEFT JOIN users u ON v.assigned_doctor_id = u.id
            LEFT JOIN organizations o ON v.organization_id = o.id
            WHERE v.patient_id = $1
            ORDER BY v.created_at DESC
        `;

        const visitRes = await pool.query(visitQuery, [patient.patient_id]);

        console.log(`✅ Retrieved ${visitRes.rows.length} visits via model query.`);

        if (visitRes.rows.length > 0) {
            const v = visitRes.rows[0];
            console.log('📝 Sample Visit Data:');
            console.log(`   - ID: ${v.id}`);
            console.log(`   - Status: ${v.status}`);
            console.log(`   - Hospital: ${v.hospital_name}`);
            console.log(`   - Doctor: ${v.doctor_first_name} ${v.doctor_last_name}`);
        }

        await pool.end();

    } catch (error) {
        console.error('❌ Error verifying patient visits:', error);
        await pool.end();
    }
};

verifyPatientVisits();
