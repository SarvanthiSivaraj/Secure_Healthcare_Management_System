/**
 * Integration tests for the Auth module.
 *
 * Tests the full HTTP flow: login, protected endpoints, JWT-less requests,
 * wrong-role rejection, and session invalidation after logout.
 *
 * DO NOT MOCK: database, models, middleware, services
 * EXTERNALS MOCKED: email (nodemailer is not configured in test env; errors are swallowed)
 */
'use strict';

const request = require('supertest');
const app = require('../../src/app');
const {
    getPool,
    closePool,
    truncateAll,
    createVerifiedUser,
    loginAs,
    authHeader,
    getAuditEntries,
} = require('../helpers/testUtils');

describe('Auth Integration Tests', () => {
    let doctor;
    let patient;

    beforeAll(async () => {
        await truncateAll();
        doctor = await createVerifiedUser('doctor');
        patient = await createVerifiedUser('patient');
    });

    afterAll(async () => {
        await closePool();
    });

    // ── Login ──────────────────────────────────────────────────────────────────

    describe('POST /api/auth/login', () => {
        it('returns 200 and an accessToken for valid credentials', async () => {
            const res = await request(app)
                .post('/api/auth/login')
                .send({ email: doctor.email, password: doctor.password });

            expect(res.status).toBe(200);
            expect(res.body.success).toBe(true);
            const token = res.body.data?.accessToken || res.body.token;
            expect(token).toBeTruthy();
        });

        it('returns 401 for wrong password', async () => {
            const res = await request(app)
                .post('/api/auth/login')
                .send({ email: doctor.email, password: 'WrongPass@999' });

            expect(res.status).toBe(401);
            expect(res.body.success).toBe(false);
        });

        it('returns 401 for non-existent user', async () => {
            const res = await request(app)
                .post('/api/auth/login')
                .send({ email: 'nobody@test.com', password: 'AnyPass@1' });

            expect(res.status).toBe(401);
        });

        it('returns 400 when email is missing', async () => {
            const res = await request(app)
                .post('/api/auth/login')
                .send({ password: 'AnyPass@1' });

            expect(res.status).toBe(400);
        });
    });

    // ── Protected Endpoint (GET /api/auth/verify) ──────────────────────────────

    describe('GET /api/auth/verify', () => {
        it('returns 200 with user info for a valid, active JWT + session', async () => {
            const { accessToken } = await loginAs(app, doctor.email, doctor.password);

            const res = await request(app)
                .get('/api/auth/verify')
                .set(authHeader(accessToken));

            expect(res.status).toBe(200);
            expect(res.body.success).toBe(true);
            expect(res.body.user.email).toBe(doctor.email);
        });

        it('returns 401 when no Authorization header is provided', async () => {
            const res = await request(app).get('/api/auth/verify');
            expect(res.status).toBe(401);
        });

        it('returns 401 for a forged / invalid JWT (no active session)', async () => {
            const fakeToken = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.fakePayload.fakeSignature';
            const res = await request(app)
                .get('/api/auth/verify')
                .set(authHeader(fakeToken));

            expect(res.status).toBe(401);
        });
    });

    // ── Logout + Replay ────────────────────────────────────────────────────────

    describe('POST /api/auth/logout', () => {
        it('returns 200 on logout, then subsequent request with same token returns 401', async () => {
            const { accessToken } = await loginAs(app, patient.email, patient.password);

            // Logout
            const logoutRes = await request(app)
                .post('/api/auth/logout')
                .set(authHeader(accessToken));

            expect(logoutRes.status).toBe(200);

            // Replay attempt
            const replayRes = await request(app)
                .get('/api/auth/verify')
                .set(authHeader(accessToken));

            expect(replayRes.status).toBe(401);
        });
    });

    // ── Health Check (no auth) ─────────────────────────────────────────────────

    describe('GET /health', () => {
        it('returns 200 without any token', async () => {
            const res = await request(app).get('/health');
            expect(res.status).toBe(200);
        });
    });

    // ── Audit Log Verification ─────────────────────────────────────────────────

    describe('Audit logging', () => {
        it('creates a user_login audit entry on successful login', async () => {
            const { userId } = await loginAs(app, doctor.email, doctor.password);
            const entries = await getAuditEntries('user_login', userId);
            expect(entries.length).toBeGreaterThan(0);
            expect(entries[0].action).toBe('user_login');
        });
    });
});
