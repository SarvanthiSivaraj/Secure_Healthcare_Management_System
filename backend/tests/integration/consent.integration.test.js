/**
 * Integration tests for the Consent module.
 *
 * Validates the full consent grant/revoke flow and middleware enforcement.
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
    loginAs,
    authHeader,
    grantConsent,
    getAuditEntries,
} = require('../helpers/testUtils');

describe('Consent Integration Tests', () => {
    let patient;
    let doctor;
    let patientToken;
    let doctorToken;

    beforeAll(async () => {
        await truncateAll();
        patient = await createVerifiedUser('patient');
        doctor = await createVerifiedUser('doctor');

        const patientLogin = await loginAs(app, patient.email, patient.password);
        const doctorLogin = await loginAs(app, doctor.email, doctor.password);

        patientToken = patientLogin.accessToken;
        doctorToken = doctorLogin.accessToken;
    });

    afterAll(async () => {
        await closePool();
    });

    // ── Grant Consent ──────────────────────────────────────────────────────────

    describe('POST /api/consent/grant', () => {
        it('patient can grant consent to a doctor (201)', async () => {
            const res = await request(app)
                .post('/api/consent/grant')
                .set(authHeader(patientToken))
                .send({
                    recipientUserId: doctor.id,
                    dataCategory: 'all_medical_data',
                    purpose: 'treatment',
                    accessLevel: 'read',
                });

            expect(res.status).toBe(201);
            expect(res.body.success).toBe(true);
            expect(res.body.data.patient_id).toBe(patient.id);
            expect(res.body.data.recipient_user_id).toBe(doctor.id);
        });

        it('returns 400 when required fields are missing', async () => {
            const res = await request(app)
                .post('/api/consent/grant')
                .set(authHeader(patientToken))
                .send({ recipientUserId: doctor.id }); // missing required fields

            expect(res.status).toBe(400);
        });

        it('returns 401 when no token is provided', async () => {
            const res = await request(app)
                .post('/api/consent/grant')
                .send({
                    recipientUserId: doctor.id,
                    dataCategory: 'all_medical_data',
                    purpose: 'treatment',
                    accessLevel: 'read',
                });

            expect(res.status).toBe(401);
        });
    });

    // ── Get Active Consents ────────────────────────────────────────────────────

    describe('GET /api/consent/active', () => {
        it('patient can retrieve their active consents', async () => {
            const res = await request(app)
                .get('/api/consent/active')
                .set(authHeader(patientToken));

            expect(res.status).toBe(200);
            expect(Array.isArray(res.body)).toBe(true);
        });

        it('returns 401 without token', async () => {
            const res = await request(app).get('/api/consent/active');
            expect(res.status).toBe(401);
        });
    });

    // ── Revoke Consent ─────────────────────────────────────────────────────────

    describe('PUT /api/consent/revoke/:consentId', () => {
        let consentId;

        beforeAll(async () => {
            // Grant a consent directly in DB
            const consent = await grantConsent(patient.id, doctor.id);
            consentId = consent.id;
        });

        it('patient can revoke an active consent (200)', async () => {
            const res = await request(app)
                .put(`/api/consent/revoke/${consentId}`)
                .set(authHeader(patientToken));

            expect(res.status).toBe(200);
            expect(res.body.success).toBe(true);
        });

        it('returns 400 when trying to revoke an already-revoked consent', async () => {
            const res = await request(app)
                .put(`/api/consent/revoke/${consentId}`)
                .set(authHeader(patientToken));

            expect(res.status).toBe(400);
        });

        it('returns 404 when consentId does not exist', async () => {
            const fakeId = '00000000-0000-4000-8000-000000000000';
            const res = await request(app)
                .put(`/api/consent/revoke/${fakeId}`)
                .set(authHeader(patientToken));

            expect(res.status).toBe(404);
        });

        it('doctor cannot revoke a patient consent (404)', async () => {
            // Create a fresh consent
            const newConsent = await grantConsent(patient.id, doctor.id);

            const res = await request(app)
                .put(`/api/consent/revoke/${newConsent.id}`)
                .set(authHeader(doctorToken));

            // Doctor has no patient role — RBAC middleware returns 403 before controller is reached
            expect([403, 404]).toContain(res.status);
        });
    });

    // ── Audit Log Verification ─────────────────────────────────────────────────

    describe('Audit: consent_grant audit log', () => {
        it('creates a consent_grant entry in audit_logs after granting', async () => {
            const entries = await getAuditEntries('consent_grant', patient.id);
            expect(entries.length).toBeGreaterThan(0);
        });
    });

    describe('Audit: consent_revoke audit log', () => {
        it('creates a consent_revoke entry in audit_logs after revoking', async () => {
            const entries = await getAuditEntries('consent_revoke', patient.id);
            expect(entries.length).toBeGreaterThan(0);
        });
    });
});
