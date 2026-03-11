/**
 * Integration tests for the Clinical Workflow module.
 *
 * Tests lab order creation, imaging order creation, visit state transitions,
 * and staff assignment/access control.
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
} = require('../helpers/testUtils');

describe('Workflow Integration Tests', () => {
    let patient;
    let doctor;
    let nurse;
    let unlinkedDoctor;
    let org;
    let activeVisit;
    let doctorToken;
    let nurseToken;
    let unlinkedDoctorToken;
    let patientToken;

    beforeAll(async () => {
        await truncateAll();

        patient = await createVerifiedUser('patient');
        doctor = await createVerifiedUser('doctor');
        nurse = await createVerifiedUser('nurse');
        unlinkedDoctor = await createVerifiedUser('doctor');

        org = await insertOrg();
        await linkStaffToOrg(doctor.id, org.id, 'doctor');
        await linkStaffToOrg(nurse.id, org.id, 'nurse');
        // unlinkedDoctor is NOT linked to any org

        activeVisit = await createVisit(patient.id, org.id, 'in_progress');

        const dl = await loginAs(app, doctor.email, doctor.password);
        const nl = await loginAs(app, nurse.email, nurse.password);
        const ul = await loginAs(app, unlinkedDoctor.email, unlinkedDoctor.password);
        const pl = await loginAs(app, patient.email, patient.password);

        doctorToken = dl.accessToken;
        nurseToken = nl.accessToken;
        unlinkedDoctorToken = ul.accessToken;
        patientToken = pl.accessToken;
    });

    afterAll(async () => {
        await closePool();
    });

    // ── Lab Orders ─────────────────────────────────────────────────────────────

    describe('POST /api/emr/lab-orders', () => {
        it('doctor can create a lab order for an active visit (201)', async () => {
            const res = await request(app)
                .post('/api/emr/lab-orders')
                .set(authHeader(doctorToken))
                .send({
                    patientId: patient.id,
                    visitId: activeVisit.id,
                    testName: 'Complete Blood Count',
                    testCategory: 'hematology',
                    urgency: 'routine',
                    clinicalIndication: 'Routine check',
                });

            expect(res.status).toBe(201);
            expect(res.body.success).toBe(true);
        });

        it('returns 401 without auth token', async () => {
            const res = await request(app)
                .post('/api/emr/lab-orders')
                .send({
                    patientId: patient.id,
                    visitId: activeVisit.id,
                    testName: 'CBC',
                    testCategory: 'hematology',
                    urgency: 'routine',
                    clinicalIndication: 'Test',
                });

            expect(res.status).toBe(401);
        });
    });

    // ── Get Lab Orders ─────────────────────────────────────────────────────────

    describe('GET /api/emr/visits/:visitId/lab-orders', () => {
        it('doctor can retrieve lab orders for a visit', async () => {
            const res = await request(app)
                .get(`/api/emr/visits/${activeVisit.id}/lab-orders`)
                .set(authHeader(doctorToken));

            expect(res.status).toBe(200);
            expect(res.body.success).toBe(true);
        });
    });

    // ── Imaging Orders ─────────────────────────────────────────────────────────

    describe('POST /api/emr/imaging-orders', () => {
        it('doctor can create an imaging order (201)', async () => {
            const res = await request(app)
                .post('/api/emr/imaging-orders')
                .set(authHeader(doctorToken))
                .send({
                    patientId: patient.id,
                    visitId: activeVisit.id,
                    imagingType: 'x-ray',
                    bodyPart: 'Chest',
                    urgency: 'routine',
                    clinicalIndication: 'Suspected pneumonia',
                });

            expect(res.status).toBe(201);
            expect(res.body.success).toBe(true);
        });
    });

    // ── Hospital Visits (Staff) ────────────────────────────────────────────────

    describe('GET /api/visits/hospital (Staff access)', () => {
        it('nurse linked to org can view hospital visits', async () => {
            const res = await request(app)
                .get('/api/visits/hospital')
                .set(authHeader(nurseToken));

            expect(res.status).toBe(200);
        });

        it('doctor NOT linked to any org gets 403 on hospital visits', async () => {
            const res = await request(app)
                .get('/api/visits/hospital')
                .set(authHeader(unlinkedDoctorToken));

            expect(res.status).toBe(403);
        });
    });

    // ── Assigned Visits (Doctor/Nurse) ─────────────────────────────────────────

    describe('GET /api/visits/assigned', () => {
        it('doctor can view their assigned visits', async () => {
            const res = await request(app)
                .get('/api/visits/assigned')
                .set(authHeader(doctorToken));

            expect(res.status).toBe(200);
        });

        it('patient cannot view assigned visits (403)', async () => {
            const res = await request(app)
                .get('/api/visits/assigned')
                .set(authHeader(patientToken));

            expect(res.status).toBe(403);
        });
    });
});
