require('dotenv').config();
const { pool } = require('../config/db');

async function assignPatient() {
    // Parse arguments
    const args = process.argv.slice(2);
    let nurseEmail = 'nurse.maya@hospital.com';
    let patientEmail = 'alice.martin@patient.com';

    for (let i = 0; i < args.length; i++) {
        if (args[i] === '--nurse' && args[i + 1]) {
            nurseEmail = args[i + 1];
        } else if (args[i] === '--patient' && args[i + 1]) {
            patientEmail = args[i + 1];
        }
    }

    console.log(`Assigning Patient (${patientEmail}) to Nurse (${nurseEmail})...`);

    try {
        // 1. Get Nurse
        const nurseRes = await pool.query("SELECT id FROM users WHERE email = $1", [nurseEmail]);
        if (nurseRes.rows.length === 0) {
            console.error(`Nurse not found with email: ${nurseEmail}`);
            process.exit(1);
        }
        const nurseId = nurseRes.rows[0].id;

        // 2. Get Patient
        const patientRes = await pool.query("SELECT id FROM users WHERE email = $1", [patientEmail]);
        if (patientRes.rows.length === 0) {
            console.error(`Patient not found with email: ${patientEmail}`);
            process.exit(1);
        }
        const patientId = patientRes.rows[0].id;

        // 3. Get Organization (just grab the first active one)
        const orgRes = await pool.query("SELECT id FROM organizations WHERE status = 'active' LIMIT 1");
        if (orgRes.rows.length === 0) {
            console.error(`No active organization found.`);
            process.exit(1);
        }
        const orgId = orgRes.rows[0].id;

        // 4. Create an active visit for the patient if they don't have one
        let visitId;
        const activeVisitRes = await pool.query(`
            SELECT id FROM visits 
            WHERE patient_id = $1 AND status IN ('pending', 'approved', 'checked_in', 'in_progress')
            LIMIT 1
        `, [patientId]);

        if (activeVisitRes.rows.length > 0) {
            visitId = activeVisitRes.rows[0].id;
            console.log(`Found existing active visit: ${visitId}`);
        } else {
            console.log(`Creating new visit for patient...`);
            const visitCode = 'V-' + Math.random().toString(36).substring(2, 8).toUpperCase();
            const insertVisitQuery = `
                INSERT INTO visits (
                    patient_id, organization_id, chief_complaint, type, status, visit_code
                )
                VALUES ($1, $2, 'Routine follow-up', 'walk_in', 'checked_in', $3)
                RETURNING id
            `;
            const newVisitRes = await pool.query(insertVisitQuery, [patientId, orgId, visitCode]);
            visitId = newVisitRes.rows[0].id;
            console.log(`Created new visit: ${visitId}`);
        }

        // 5. Assign Nurse to the visit in visit_staff_assignments
        console.log(`Assigning nurse to visit...`);
        const assignQuery = `
            INSERT INTO visit_staff_assignments(visit_id, staff_user_id, role)
            VALUES($1, $2, 'nurse')
            ON CONFLICT(visit_id, staff_user_id) 
            DO UPDATE SET role = EXCLUDED.role
            RETURNING *
        `;
        await pool.query(assignQuery, [visitId, nurseId]);

        console.log(`\n✅ SUCCESSFULLY ASSIGNED!`);
        console.log(`Patient (${patientEmail}) is now assigned to Nurse (${nurseEmail}).`);
        console.log(`Log in as 'nurse.maya@hospital.com' to see the patient on the Assigned Patients list.`);

    } catch (err) {
        console.error("ERROR CAUGHT:", err.message);
    } finally {
        process.exit(0);
    }
}

assignPatient();
