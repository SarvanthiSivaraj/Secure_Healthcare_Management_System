import { rest } from 'msw';

// Mirror the apiClient base URL exactly — REACT_APP_API_URL already contains /api in CI,
// but falls back to http://localhost:5000/api for local Jest.  Keep this in sync with
// src/api/client.js so MSW intercepts the exact URLs the app requests.
const BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';

export const handlers = [
    // ── Auth ──────────────────────────────────────────────────────────────────
    rest.post(`${BASE_URL}/auth/login`, async (req, res, ctx) => {
        const { emailOrPhone } = await req.json();
        if (emailOrPhone === 'doctor@test.com') {
            return res(
                ctx.status(200),
                ctx.json({
                    success: true,
                    data: {
                        accessToken: 'fake-jwt-token',
                        user: {
                            id: 'uid-1',
                            email: 'doctor@test.com',
                            role: 'doctor',
                            first_name: 'Test',
                            last_name: 'Doctor',
                        },
                    },
                })
            );
        }
        return res(
            ctx.status(401),
            ctx.json({ success: false, message: 'Invalid email or password' })
        );
    }),

    rest.post(`${BASE_URL}/auth/logout`, (_req, res, ctx) => {
        return res(ctx.status(200), ctx.json({ success: true }));
    }),

    // ── Consent ───────────────────────────────────────────────────────────────
    rest.get(`${BASE_URL}/consent/active`, (_req, res, ctx) => {
        return res(
            ctx.status(200),
            ctx.json([
                { id: 'consent-1', status: 'active' },
                { id: 'consent-2', status: 'active' },
            ])
        );
    }),

    // ── EMR ───────────────────────────────────────────────────────────────────
    rest.get(`${BASE_URL}/emr/patients/:id/medical-records`, (_req, res, ctx) => {
        return res(
            ctx.status(200),
            ctx.json({
                success: true,
                data: [{ id: 'rec-1', type: 'consultation', title: 'Checkup', description: 'All good' }],
            })
        );
    }),

    // ── Visits ────────────────────────────────────────────────────────────────
    rest.get(`${BASE_URL}/visits/my-visits`, (_req, res, ctx) => {
        return res(
            ctx.status(200),
            ctx.json({
                success: true,
                data: [{ id: 'visit-1', status: 'completed', visit_code: 'VC123' }],
            })
        );
    }),

    // ── Patient API ───────────────────────────────────────────────────────────
    rest.get(`${BASE_URL}/patient/profile`, (_req, res, ctx) => {
        return res(
            ctx.status(200),
            ctx.json({ success: true, data: { firstName: 'John', lastName: 'Doe', id: 'PT-123' } })
        );
    }),

    rest.get(`${BASE_URL}/patient/health-facts`, (_req, res, ctx) => {
        return res(
            ctx.status(200),
            ctx.json({
                success: true,
                data: [{ title: 'Blood Pressure', description: 'Normal 120/80' }],
            })
        );
    }),

    rest.get(`${BASE_URL}/patient/activities`, (_req, res, ctx) => {
        return res(
            ctx.status(200),
            ctx.json({
                success: true,
                data: [{ id: 'act-1', type: 'login', title: 'Logged in', date: '2026-03-10' }],
            })
        );
    }),

    // ── Audit ─────────────────────────────────────────────────────────────────
    rest.get(`${BASE_URL}/audit/my-trail`, (_req, res, ctx) => {
        return res(
            ctx.status(200),
            ctx.json({
                success: true,
                data: [{ id: 'audit-1', action: 'login', timestamp: '2026-03-10T00:00:00Z' }],
            })
        );
    }),
];
