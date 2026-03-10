require('dotenv').config();
const fs = require('fs');
const path = require('path');
const { pool } = require('../config/db');

async function setupInsuranceDb() {
    try {
        console.log('Starting Insurance Database setup...');

        const schemaPath = path.join(__dirname, 'schema_insurance.sql');
        const schemaSql = fs.readFileSync(schemaPath, 'utf8');

        console.log('Executing schema_insurance.sql...');
        await pool.query(schemaSql);
        console.log('Insurance schema applied successfully.');

        // Insert some seed data for testing
        console.log('Seeding insurance data...');
        // Find existing patient to link
        const patientResult = await pool.query(`SELECT id, first_name, last_name FROM users WHERE role_id = (SELECT id FROM roles WHERE name = 'patient') LIMIT 5`);

        if (patientResult.rows.length > 0) {
            const patients = patientResult.rows;
            const patient1 = patients[0];
            const patient2 = patients.length > 1 ? patients[1] : patient1;

            const seedSql = `
                INSERT INTO insurance_policies (id, patient_id, member_name, type, status, coverage_start, coverage_end, copay, deductible_used, deductible_total)
                VALUES 
                ('POL-123456', $1, $2, 'Premium', 'Active', '2025-01-01', '2026-12-31', 25.00, 1500.00, 5000.00),
                ('POL-654321', $3, $4, 'Basic', 'Active', '2025-06-01', '2026-05-31', 50.00, 200.00, 2000.00),
                ('POL-111222', $1, $2, 'Family', 'Expired', '2024-01-01', '2024-12-31', 15.00, 5000.00, 5000.00)
                ON CONFLICT (id) DO NOTHING;
            `;
            await pool.query(seedSql, [
                patient1.id, `${patient1.first_name} ${patient1.last_name}`,
                patient2.id, `${patient2.first_name} ${patient2.last_name}`
            ]);

            const claimsSeedSql = `
                INSERT INTO insurance_claims (id, patient_id, policy_id, diagnosis, amount, status, notes)
                VALUES 
                ('CLM-001', $1, 'POL-123456', 'Hypertension', 150.00, 'Pending', NULL),
                ('CLM-002', $3, 'POL-654321', 'Type 2 Diabetes', 350.50, 'Approved', 'Coverage verified'),
                ('CLM-003', $1, 'POL-111222', 'Asthma Checkup', 80.00, 'Denied', 'Policy expired at the time of service')
                ON CONFLICT (id) DO NOTHING;
            `;
            await pool.query(claimsSeedSql, [
                patient1.id, `${patient1.first_name} ${patient1.last_name}`,
                patient2.id, `${patient2.first_name} ${patient2.last_name}`
            ]);

            console.log('Insurance seed data inserted successfully.');
        } else {
            console.log('No patients found to seed insurance data.');
        }

    } catch (err) {
        console.error('Error setting up Insurance Database:', err);
    } finally {
        await pool.end();
        process.exit();
    }
}

setupInsuranceDb();
