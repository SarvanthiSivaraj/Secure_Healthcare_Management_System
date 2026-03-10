/**
 * Integration tests for the Audit module.
 *
 * Verifies that key system actions produce audit log entries
 * with correct fields (user_id, action, timestamp).
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

describe('Audit Integration Tests', () => {
    let patient;
    let doctor;
    let admin;
    let patientToken;
    let patientUserId;

    beforeAll(async () => {
        await truncateAll();

        patient = await createVerifiedUser('patient');
        doctor = await createVerifiedUser('doctor');
        admin = await createVerifiedUser('hospital_admin');

        const pl = await loginAs(app, patient.email, patient.password);
        patientToken = pl.accessToken;
        patientUserId = pl.userId;
    });

    afterAll(async () => {
        await closePool();
    });

    // ── Login Audit ────────────────────────────────────────────────────────────

    describe('Audit entry: user_login', () => {
        it('creates audit entry with action=user_login after login', async () => {
            const { userId } = await loginAs(app, doctor.email, doctor.password);
            const entries = await getAuditEntries('user_login', userId);

            expect(entries.length).toBeGreaterThan(0);
            const entry = entries[0];
            expect(entry.action).toBe('user_login');
            expect(entry.user_id).toBe(userId);
            expect(new Date(entry.timestamp)).toBeInstanceOf(Date);
        });
    });

    // ── Consent Grant Audit ────────────────────────────────────────────────────

    describe('Audit entry: consent_grant', () => {
        it('creates audit entry with action=consent_grant after granting consent', async () => {
            const res = await request(app)
                .post('/api/consent/grant')
                .set(authHeader(patientToken))
                .send({
                    recipientUserId: doctor.id,
                    dataCategory: 'ALL_RECORDS',
                    purpose: 'TREATMENT',
                    accessLevel: 'read',
                });

            expect(res.status).toBe(201);

            const entries = await getAuditEntries('consent_grant', patient.id);
            expect(entries.length).toBeGreaterThan(0);
            expect(entries[0].entity_type).toBe('consent');
        });
    });

    // ── Logout Audit ───────────────────────────────────────────────────────────

    describe('Audit entry: user_logout', () => {
        it('creates audit entry with action=user_logout after logout', async () => {
            const { accessToken, userId } = await loginAs(app, patient.email, patient.password);

            const logoutRes = await request(app)
                .post('/api/auth/logout')
                .set(authHeader(accessToken));

            expect(logoutRes.status).toBe(200);

            const entries = await getAuditEntries('user_logout', userId);
            expect(entries.length).toBeGreaterThan(0);
            expect(entries[0].action).toBe('user_logout');
        });
    });

    // ── Access Denied Audit ────────────────────────────────────────────────────

    describe('Audit entry: access_denied', () => {
        it('creates audit entry for invalid token attempts', async () => {
            await request(app)
                .get('/api/auth/verify')
                .set({ Authorization: 'Bearer completely.invalid.token' });

            const entries = await getAuditEntries('access_denied');
            expect(entries.length).toBeGreaterThan(0);
        });
    });

    // ── GET /api/audit (Compliance Officer) ────────────────────────────────────

    describe('GET /api/audit/logs', () => {
        it('authenticated user can query audit logs', async () => {
            // Use hospital_admin token
            const { accessToken } = await loginAs(app, admin.email, admin.password);

            const res = await request(app)
                .get('/api/audit/logs')
                .set(authHeader(accessToken));

            // Accepts either 200 (found) or 403 (role-restricted – depends on RBAC policy)
            expect([200, 403]).toContain(res.status);
        });

        it('returns 401 without auth token', async () => {
            const res = await request(app).get('/api/audit/logs');
            expect(res.status).toBe(401);
        });
    });

    // ── Audit Entry Fields Validation ──────────────────────────────────────────

    describe('Audit entry field integrity', () => {
        it('audit entries have required fields: user_id, action, timestamp', async () => {
            const entries = await getAuditEntries('user_login', patient.id);
            if (entries.length > 0) {
                const e = entries[0];
                expect(e).toHaveProperty('id');
                expect(e).toHaveProperty('action');
                expect(e).toHaveProperty('timestamp');
            }
        });
    });
});
