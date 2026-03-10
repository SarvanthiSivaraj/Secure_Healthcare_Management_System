/**
 * Integration tests for the EMR module.
 *
 * Tests medical record creation, retrieval, and access control.
 * No mocks for DB/models/middleware.
 */
'use strict';

const request = require('supertest');
const app = require('../../src/app');
const {
    getPool,
    closePool,
    truncateAll,
    createVerifiedUser,
    insertOrg,
    linkStaffToOrg,
    loginAs,
    authHeader,
    createVisit,
    getAuditEntries,
} = require('../helpers/testUtils');

describe('EMR Integration Tests', () => {
    let patient;
    let doctor;
    let anotherPatient;
    let org;
    let patientToken;
    let doctorToken;
    let anotherPatientToken;
    let activeVisit;

    beforeAll(async () => {
        await truncateAll();

        patient = await createVerifiedUser('patient');
        doctor = await createVerifiedUser('doctor');
        anotherPatient = await createVerifiedUser('patient');

        org = await insertOrg();
        await linkStaffToOrg(doctor.id, org.id, 'doctor');

        // Create an active (in_progress) visit directly in DB
        activeVisit = await createVisit(patient.id, org.id, 'in_progress');

        const pl = await loginAs(app, patient.email, patient.password);
        const dl = await loginAs(app, doctor.email, doctor.password);
        const al2 = await loginAs(app, anotherPatient.email, anotherPatient.password);

        patientToken = pl.accessToken;
        doctorToken = dl.accessToken;
        anotherPatientToken = al2.accessToken;
    });

    afterAll(async () => {
        await closePool();
    });

    // ── Create Medical Record ──────────────────────────────────────────────────

    describe('POST /api/emr/medical-records', () => {
        it('doctor can create a medical record for a patient (201)', async () => {
            const res = await request(app)
                .post('/api/emr/medical-records')
                .set(authHeader(doctorToken))
                .send({
                    patientId: patient.id,
                    visitId: activeVisit.id,
                    type: 'consultation',
                    title: 'Initial Consultation Notes',
                    description: 'Patient presents with mild headache.',
                });

            expect(res.status).toBe(201);
            expect(res.body.success).toBe(true);
            expect(res.body.data.patient_id).toBe(patient.id);
        });

        it('returns 401 without authentication', async () => {
            const res = await request(app)
                .post('/api/emr/medical-records')
                .send({
                    patientId: patient.id,
                    visitId: activeVisit.id,
                    type: 'consultation',
                    title: 'Test',
                });

            expect(res.status).toBe(401);
        });
    });

    // ── Get Patient Medical Records ────────────────────────────────────────────

    describe('GET /api/emr/patients/:patientId/medical-records', () => {
        it('doctor can retrieve a patient\'s medical records', async () => {
            const res = await request(app)
                .get(`/api/emr/patients/${patient.id}/medical-records`)
                .set(authHeader(doctorToken));

            expect(res.status).toBe(200);
            expect(res.body.success).toBe(true);
            expect(Array.isArray(res.body.data)).toBe(true);
        });

        it('returns 401 without authentication', async () => {
            const res = await request(app)
                .get(`/api/emr/patients/${patient.id}/medical-records`);

            expect(res.status).toBe(401);
        });
    });

    // ── Diagnoses ──────────────────────────────────────────────────────────────

    describe('POST /api/emr/diagnoses', () => {
        let recordId;

        beforeAll(async () => {
            // Create a medical record to pin the diagnosis to
            const pool = getPool();
            const result = await pool.query(
                `INSERT INTO medical_records (patient_id, visit_id, type, title, created_by)
                 VALUES ($1, $2, 'diagnosis', 'Diagnosis Record', $3)
                 RETURNING id`,
                [patient.id, activeVisit.id, doctor.id]
            );
            recordId = result.rows[0].id;
        });

        it('doctor can create a diagnosis (201)', async () => {
            const res = await request(app)
                .post('/api/emr/diagnoses')
                .set(authHeader(doctorToken))
                .send({
                    recordId,
                    icdCode: 'G43.909',
                    description: 'Migraine, unspecified',
                    severity: 'mild',
                });

            expect(res.status).toBe(201);
            expect(res.body.success).toBe(true);
        });

        it('returns 401 without authentication', async () => {
            const res = await request(app)
                .post('/api/emr/diagnoses')
                .send({
                    recordId,
                    icdCode: 'G43.909',
                    description: 'Test',
                    severity: 'mild',
                });

            expect(res.status).toBe(401);
        });
    });

    // ── Prescriptions ──────────────────────────────────────────────────────────

    describe('POST /api/emr/prescriptions', () => {
        let prescRecordId;

        beforeAll(async () => {
            const pool = getPool();
            const result = await pool.query(
                `INSERT INTO medical_records (patient_id, visit_id, type, title, created_by)
                 VALUES ($1, $2, 'prescription', 'Prescription Record', $3)
                 RETURNING id`,
                [patient.id, activeVisit.id, doctor.id]
            );
            prescRecordId = result.rows[0].id;
        });

        it('doctor can create a prescription (201)', async () => {
            const res = await request(app)
                .post('/api/emr/prescriptions')
                .set(authHeader(doctorToken))
                .send({
                    recordId: prescRecordId,
                    medication: 'Ibuprofen',
                    dosage: '400mg',
                    frequency: 'Twice daily',
                    duration: '5 days',
                    route: 'oral',
                });

            expect(res.status).toBe(201);
            expect(res.body.success).toBe(true);
        });
    });

    // ── Audit ──────────────────────────────────────────────────────────────────

    describe('Audit: EMR record creation logged', () => {
        it('creates a create_medical_record audit entry', async () => {
            const entries = await getAuditEntries('create_medical_record');
            expect(entries.length).toBeGreaterThan(0);
        });
    });
});
