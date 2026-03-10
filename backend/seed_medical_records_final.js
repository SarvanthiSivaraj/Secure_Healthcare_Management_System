const { Pool } = require('pg');
require('dotenv').config();

const pool = new Pool({
    host: process.env.DB_HOST,
    port: process.env.DB_PORT,
    database: process.env.DB_NAME,
    user: process.env.DB_USER,
    password: String(process.env.DB_PASSWORD),
});

const PATIENT_ID = '277234ef-e6e4-44c4-ae5f-2925e35aa6f0';
const DOCTOR_ID = 'd230cd32-e3d5-4e69-a9b6-f27c14037d39';

async function seed() {
    try {
        console.log('--- Enhanced Medical Records Seed ---');

        // 1. Find an active visit if it exists
        const visitRes = await pool.query(`
      SELECT id FROM visits 
      WHERE patient_id = $1 
      AND status IN ('scheduled', 'checked_in', 'in_progress') 
      ORDER BY created_at DESC LIMIT 1
    `, [PATIENT_ID]);

        const visitId = visitRes.rows[0]?.id || null;
        if (visitId) {
            console.log(`Linking records to active visit: ${visitId}`);
        } else {
            console.log('No active visit found, creating visit-less records.');
        }

        // 2. Clear existing test records for this patient to avoid duplicates/clutter
        // (Optional, but good for "adding info" as requested)
        // await pool.query("DELETE FROM medical_records WHERE patient_id = $1", [PATIENT_ID]);

        // 3. Insert Records

        // Consultation
        const res1 = await pool.query(`
      INSERT INTO medical_records (patient_id, visit_id, type, title, description, created_by, immutable_flag)
      VALUES ($1, $2, 'consultation', 'Routine Wellness Checkup', 
      'Patient reports feeling well. No major complaints. Blood pressure is stable. Recommending continued exercise.', 
      $3, true)
      RETURNING id
    `, [PATIENT_ID, visitId, DOCTOR_ID]);
        const record1Id = res1.rows[0].id;

        await pool.query(`
      INSERT INTO diagnoses (record_id, icd_code, description, severity, status, is_primary, diagnosed_by, version)
      VALUES ($1, 'Z00.00', 'General adult medical examination', 'mild', 'resolved', true, $2, 1)
    `, [record1Id, DOCTOR_ID]);

        // Prescription
        const res2 = await pool.query(`
      INSERT INTO medical_records (patient_id, visit_id, type, title, description, created_by, immutable_flag)
      VALUES ($1, $2, 'prescription', 'Hypertension Maintenance', 'Monthly prescription renewal for Lisinopril.', $3, true)
      RETURNING id
    `, [PATIENT_ID, visitId, DOCTOR_ID]);
        const record2Id = res2.rows[0].id;

        await pool.query(`
      INSERT INTO prescriptions (record_id, medication, generic_name, drug_code, dosage, frequency, route, duration, quantity, prescribed_by, status)
      VALUES ($1, 'Lisinopril', 'Lisinopril', 'LIS10', '10mg', 'Once daily', 'oral', '30 days', 30, $2, 'active')
    `, [record2Id, DOCTOR_ID]);

        // Lab Result
        const res3 = await pool.query(`
      INSERT INTO medical_records (patient_id, visit_id, type, title, description, created_by, immutable_flag)
      VALUES ($1, $2, 'lab_result', 'Blood Lipid Profile', 'Routine cholesterol screening.', $3, true)
      RETURNING id
    `, [PATIENT_ID, visitId, DOCTOR_ID]);
        const record3Id = res3.rows[0].id;

        await pool.query(`
      INSERT INTO lab_results (record_id, test_name, test_code, test_category, results_data, interpretation, reference_range, abnormal_flag, ordered_by, performed_by, result_date, immutable)
      VALUES ($1, 'Lipid Panel', 'LP-SET', 'Biochemistry', '{"Total Cholesterol": 185, "LDL": 110, "HDL": 55, "Triglycerides": 100}', 
      'Results within normal range.', 'Total < 200, LDL < 130', false, $2, $2, NOW(), true)
    `, [record3Id, DOCTOR_ID]);

        // Imaging
        const res4 = await pool.query(`
      INSERT INTO medical_records (patient_id, visit_id, type, title, description, created_by, immutable_flag)
      VALUES ($1, $2, 'imaging', 'Abdominal Ultrasound', 'Screening for abdominal pain reported last month.', $3, true)
      RETURNING id
    `, [PATIENT_ID, visitId, DOCTOR_ID]);
        const record4Id = res4.rows[0].id;

        await pool.query(`
      INSERT INTO imaging_reports (record_id, imaging_type, body_part, file_url, findings, impression, radiologist_notes, ordered_by, performed_by, reported_by, study_date)
      VALUES ($1, 'ultrasound', 'Abdomen', '/uploads/ultrasound_sample.png', 
      'Liver and spleen appear normal in size and texture. No stones detected in gallbladder.', 
      'Unremarkable abdominal ultrasound.', 'Clear study.', $2, $2, $2, NOW())
    `, [record4Id, DOCTOR_ID]);

        console.log('✅ Success: Sample medical records added!');

    } catch (err) {
        console.error('❌ Error during seeding:', err.message);
        if (err.detail) console.error('Detail:', err.detail);
        if (err.constraint) console.error('Constraint:', err.constraint);
    } finally {
        await pool.end();
    }
}

seed();
