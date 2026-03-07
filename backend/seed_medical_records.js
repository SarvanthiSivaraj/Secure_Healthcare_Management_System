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
        console.log('Starting medical records seed...');

        // 1. General Consultation
        const res1 = await pool.query(`
      INSERT INTO medical_records (patient_id, type, title, description, created_by, immutable_flag)
      VALUES ($1, 'consultation', 'Annual Physical Examination', 'Patient presented for annual wellness check. Generally healthy.', $2, true)
      RETURNING id
    `, [PATIENT_ID, DOCTOR_ID]);
        const record1Id = res1.rows[0].id;

        await pool.query(`
      INSERT INTO diagnoses (record_id, icd_code, description, severity, status, is_primary, diagnosed_by, version)
      VALUES ($1, 'Z00.00', 'Encounter for general adult medical examination without abnormal findings', 'mild', 'resolved', true, $2, 1)
    `, [record1Id, DOCTOR_ID]);

        // 2. Hypertension Management
        const res2 = await pool.query(`
      INSERT INTO medical_records (patient_id, type, title, description, created_by, immutable_flag)
      VALUES ($1, 'prescription', 'Hypertension Follow-up', 'Blood pressure slightly elevated. Adjusting medication.', $2, true)
      RETURNING id
    `, [PATIENT_ID, DOCTOR_ID]);
        const record2Id = res2.rows[0].id;

        await pool.query(`
      INSERT INTO prescriptions (record_id, medication, generic_name, drug_code, dosage, frequency, route, duration, quantity, prescribed_by, status)
      VALUES ($1, 'Lisinopril', 'Lisinopril', 'LIS10', '10mg', 'Once daily', 'Oral', '30 days', 30, $2, 'active')
    `, [record2Id, DOCTOR_ID]);

        // 3. Blood Work
        const res3 = await pool.query(`
      INSERT INTO medical_records (patient_id, type, title, description, created_by, immutable_flag)
      VALUES ($1, 'lab_result', 'Routine Blood Work', 'Comprehensive metabolic panel and CBC.', $2, true)
      RETURNING id
    `, [PATIENT_ID, DOCTOR_ID]);
        const record3Id = res3.rows[0].id;

        await pool.query(`
      INSERT INTO lab_results (record_id, test_name, test_code, test_category, results_data, interpretation, reference_range, abnormal_flag, ordered_by, performed_by, result_date, immutable)
      VALUES ($1, 'Complete Blood Count', 'CBC', 'Hematology', '{"WBC": 7.2, "RBC": 4.8, "HGB": 14.2}', 'Normal range results.', 'WBC: 4.5-11.0, RBC: 4.2-5.9', false, $2, $2, NOW(), true)
    `, [record3Id, DOCTOR_ID]);

        // 4. Imaging
        const res4 = await pool.query(`
      INSERT INTO medical_records (patient_id, type, title, description, created_by, immutable_flag)
      VALUES ($1, 'imaging', 'Chest X-Ray', 'Routine screening for persistent cough.', $2, true)
      RETURNING id
    `, [PATIENT_ID, DOCTOR_ID]);
        const record4Id = res4.rows[0].id;

        await pool.query(`
      INSERT INTO imaging_reports (record_id, imaging_type, body_part, findings, impression, radiologist_notes, ordered_by, performed_by, reported_by, study_date)
      VALUES ($1, 'x-ray', 'Chest', 'Lung fields are clear. No cardiomegaly.', 'Normal chest radiograph.', 'No acute cardiopulmonary process.', $2, $2, $2, NOW())
    `, [record4Id, DOCTOR_ID]);

        console.log('✅ Seeding complete!');

    } catch (err) {
        console.error('Seeding error:', err);
    } finally {
        await pool.end();
    }
}

seed();
