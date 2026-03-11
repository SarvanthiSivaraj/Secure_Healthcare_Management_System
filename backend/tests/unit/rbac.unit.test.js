/**
 * Unit tests for src/middleware/rbac.middleware.js
 * Uses Vitest with mocked req/res/next
 */
import { describe, it, expect, vi, beforeEach } from 'vitest';

// Mock the DB query so RBAC doesn't need a real DB connection
vi.mock('../../src/config/db.js', () => ({
    query: vi.fn(),
    pool: { query: vi.fn() },
}));

import { requireRole, requireOwnership } from '../../src/middleware/rbac.middleware.js';

function makeReq(roleName, userId) {
    return { user: { id: userId, roleName }, params: {}, path: '/test' };
}

function makeRes() {
    const res = {
        status: vi.fn().mockReturnThis(),
        json: vi.fn().mockReturnThis(),
    };
    return res;
}

describe('requireRole middleware', () => {
    it('calls next() when user has the required role', async () => {
        const next = vi.fn();
        const req = makeReq('doctor', 'user-1');
        const res = makeRes();

        const middleware = requireRole('doctor');
        await middleware(req, res, next);

        expect(next).toHaveBeenCalled();
        expect(res.status).not.toHaveBeenCalled();
    });

    it('returns 403 when user does not have the required role', async () => {
        const next = vi.fn();
        const req = makeReq('patient', 'user-1');
        const res = makeRes();

        const middleware = requireRole('doctor');
        await middleware(req, res, next);

        expect(next).not.toHaveBeenCalled();
        expect(res.status).toHaveBeenCalledWith(403);
    });

    it('accepts an array of allowed roles', async () => {
        const next = vi.fn();
        const req = makeReq('nurse', 'user-1');
        const res = makeRes();

        const middleware = requireRole(['doctor', 'nurse']);
        await middleware(req, res, next);

        expect(next).toHaveBeenCalled();
    });

    it('returns 401 when req.user is absent', async () => {
        const next = vi.fn();
        const req = { params: {}, path: '/test' }; // no user
        const res = makeRes();

        const middleware = requireRole('doctor');
        await middleware(req, res, next);

        expect(next).not.toHaveBeenCalled();
        expect(res.status).toHaveBeenCalledWith(401);
    });
});

describe('requireOwnership middleware', () => {
    it('calls next() when user owns the resource', () => {
        const next = vi.fn();
        const req = { user: { id: 'user-1', roleName: 'patient' }, params: { userId: 'user-1' } };
        const res = makeRes();

        requireOwnership(req, res, next);

        expect(next).toHaveBeenCalled();
    });

    it('returns 403 when user does not own the resource', () => {
        const next = vi.fn();
        const req = { user: { id: 'user-1', roleName: 'patient' }, params: { userId: 'user-2' } };
        const res = makeRes();

        requireOwnership(req, res, next);

        expect(next).not.toHaveBeenCalled();
        expect(res.status).toHaveBeenCalledWith(403);
    });

    it('allows system_admin to bypass ownership check', () => {
        const next = vi.fn();
        const req = { user: { id: 'admin-1', roleName: 'system_admin' }, params: { userId: 'user-2' } };
        const res = makeRes();

        requireOwnership(req, res, next);

        expect(next).toHaveBeenCalled();
    });
});
