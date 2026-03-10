import { rest } from 'msw';

const BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000';

export const handlers = [
    // ── Auth ──────────────────────────────────────────────────────────────────
    rest.post(`${BASE_URL}/api/auth/login`, async (req, res, ctx) => {
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

    rest.post(`${BASE_URL}/api/auth/logout`, (_req, res, ctx) => {
        return res(ctx.status(200), ctx.json({ success: true }));
    }),

    // ── Consent ───────────────────────────────────────────────────────────────
    rest.get(`${BASE_URL}/api/consent/active`, (_req, res, ctx) => {
        return res(
            ctx.status(200),
            ctx.json([
                { id: 'consent-1', status: 'active' },
                { id: 'consent-2', status: 'active' },
            ])
        );
    }),

    // ── EMR ───────────────────────────────────────────────────────────────────
    rest.get(`${BASE_URL}/api/emr/patients/:id/medical-records`, (_req, res, ctx) => {
        return res(
            ctx.status(200),
            ctx.json({
                success: true,
                data: [{ id: 'rec-1', type: 'consultation', title: 'Checkup', description: 'All good' }],
            })
        );
    }),

    // ── Visits ────────────────────────────────────────────────────────────────
    rest.get(`${BASE_URL}/api/visits/my`, (_req, res, ctx) => {
        return res(
            ctx.status(200),
            ctx.json({
                success: true,
                data: [{ id: 'visit-1', status: 'completed', visit_code: 'VC123' }],
            })
        );
    }),

    // ── Patient API ───────────────────────────────────────────────────────────
    rest.get(`${BASE_URL}/api/patient/profile`, (_req, res, ctx) => {
        return res(
            ctx.status(200),
            ctx.json({ success: true, data: { firstName: 'John', lastName: 'Doe', id: 'PT-123' } })
        );
    }),

    rest.get(`${BASE_URL}/api/patient/health-facts`, (_req, res, ctx) => {
        return res(
            ctx.status(200),
            ctx.json({
                success: true,
                data: [{ title: 'Blood Pressure', description: 'Normal 120/80' }],
            })
        );
    }),

    rest.get(`${BASE_URL}/api/patient/activities`, (_req, res, ctx) => {
        return res(
            ctx.status(200),
            ctx.json({
                success: true,
                data: [{ id: 'act-1', type: 'login', title: 'Logged in', date: '2026-03-10' }],
            })
        );
    }),
];
