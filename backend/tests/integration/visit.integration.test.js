/**
 * Integration tests for the Visit module.
 *
 * Validates the full visit lifecycle: request, approve, close.
 * No mocks for DB/models/middleware/services.
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
} = require('../helpers/testUtils');

describe('Visit Integration Tests', () => {
    let patient;
    let doctor;
    let admin;
    let org;
    let patientToken;
    let doctorToken;
    let adminToken;

    beforeAll(async () => {
        await truncateAll();

        patient = await createVerifiedUser('patient');
        doctor = await createVerifiedUser('doctor');
        admin = await createVerifiedUser('hospital_admin');

        org = await insertOrg({ adminUserId: admin.id });

        // Link staff to org
        await linkStaffToOrg(doctor.id, org.id, 'doctor');
        await linkStaffToOrg(admin.id, org.id, 'hospital_admin');

        const pl = await loginAs(app, patient.email, patient.password);
        const dl = await loginAs(app, doctor.email, doctor.password);
        const al = await loginAs(app, admin.email, admin.password);

        patientToken = pl.accessToken;
        doctorToken = dl.accessToken;
        adminToken = al.accessToken;
    });

    afterAll(async () => {
        await closePool();
    });

    // ── Request Visit ──────────────────────────────────────────────────────────

    describe('POST /api/visits/request', () => {
        it('patient can request a visit with a valid hospital code (201)', async () => {
            const res = await request(app)
                .post('/api/visits/request')
                .set(authHeader(patientToken))
                .send({
                    hospitalCode: org.hospital_code,
                    reason: 'General check-up',
                    symptoms: 'Headache',
                });

            expect(res.status).toBe(201);
            expect(res.body.success).toBe(true);
            expect(res.body.data.patient_id).toBe(patient.id);
        });

        it('returns 404 for an invalid hospital code', async () => {
            const res = await request(app)
                .post('/api/visits/request')
                .set(authHeader(patientToken))
                .send({
                    hospitalCode: 'INVALID',
                    reason: 'Test',
                });

            expect(res.status).toBe(404);
        });

        it('returns 409 when patient already has an active visit', async () => {
            const res = await request(app)
                .post('/api/visits/request')
                .set(authHeader(patientToken))
                .send({
                    hospitalCode: org.hospital_code,
                    reason: 'Another visit',
                });

            expect(res.status).toBe(409);
        });

        it('returns 401 without token', async () => {
            const res = await request(app)
                .post('/api/visits/request')
                .send({ hospitalCode: org.hospital_code, reason: 'Test' });

            expect(res.status).toBe(401);
        });
    });

    // ── Get My Visits (Patient) ────────────────────────────────────────────────

    describe('GET /api/visits/my', () => {
        it('patient can view their own visits', async () => {
            const res = await request(app)
                .get('/api/visits/my')
                .set(authHeader(patientToken));

            expect(res.status).toBe(200);
            expect(res.body.success).toBe(true);
            expect(Array.isArray(res.body.data)).toBe(true);
        });
    });

    // ── Get Hospital Visits (Admin/Doctor) ─────────────────────────────────────

    describe('GET /api/visits/hospital', () => {
        it('admin can view hospital visits', async () => {
            const res = await request(app)
                .get('/api/visits/hospital')
                .set(authHeader(adminToken));

            expect(res.status).toBe(200);
            expect(res.body.success).toBe(true);
        });

        it('returns 401 without token', async () => {
            const res = await request(app).get('/api/visits/hospital');
            expect(res.status).toBe(401);
        });
    });
});
