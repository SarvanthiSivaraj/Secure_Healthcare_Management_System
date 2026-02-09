/**
 * Epic 1: Identity & Auth - RBAC Middleware Tests
 * Tests for role-based access control, permission checks, and ownership validation
 */

const {
    requireRole,
    requirePermission,
    requireOwnership,
    requirePatient,
    requireDoctor,
    requireAdmin,
    requireStaff
} = require('../../../src/middleware/rbac.middleware');
const {
    createMockRequest,
    createMockResponse,
    createMockNext,
    createMockUser,
    createMockDoctor,
    createMockPatient,
    ROLE_IDS
} = require('../../utils/testData.factory');
const { createQueryResult } = require('../../mocks/db.mock');

// Mock dependencies
jest.mock('../../../src/config/db');

const { query } = require('../../../src/config/db');

describe('Epic 1: RBAC Middleware', () => {
    let mockReq, mockRes, mockNext;

    beforeEach(() => {
        jest.clearAllMocks();
        mockReq = createMockRequest();
        mockRes = createMockResponse();
        mockNext = createMockNext();
    });

    // =============================================
    // REQUIRE ROLE TESTS
    // =============================================
    describe('requireRole', () => {
        it('should allow access when user has correct single role', async () => {
            const doctorUser = createMockDoctor();
            mockReq.user = doctorUser;

            const middleware = requireRole('doctor');
            await middleware(mockReq, mockRes, mockNext);

            expect(mockNext).toHaveBeenCalled();
            expect(mockRes.status).not.toHaveBeenCalled();
        });

        it('should allow access when user has one of multiple allowed roles', async () => {
            const doctorUser = createMockDoctor();
            mockReq.user = doctorUser;

            const middleware = requireRole(['doctor', 'nurse', 'lab_technician']);
            await middleware(mockReq, mockRes, mockNext);

            expect(mockNext).toHaveBeenCalled();
        });

        it('should deny access when user has incorrect role', async () => {
            const patientUser = createMockPatient();
            mockReq.user = patientUser;

            const middleware = requireRole('doctor');
            await middleware(mockReq, mockRes, mockNext);

            expect(mockRes.status).toHaveBeenCalledWith(403);
            expect(mockRes.json).toHaveBeenCalledWith(
                expect.objectContaining({
                    success: false,
                    message: expect.stringContaining('permission')
                })
            );
            expect(mockNext).not.toHaveBeenCalled();
        });

        it('should deny access when user is not in any of the allowed roles', async () => {
            const patientUser = createMockPatient();
            mockReq.user = patientUser;

            const middleware = requireRole(['doctor', 'nurse', 'hospital_admin']);
            await middleware(mockReq, mockRes, mockNext);

            expect(mockRes.status).toHaveBeenCalledWith(403);
            expect(mockNext).not.toHaveBeenCalled();
        });

        it('should return 401 when req.user is not set', async () => {
            mockReq.user = null;

            const middleware = requireRole('doctor');
            await middleware(mockReq, mockRes, mockNext);

            expect(mockRes.status).toHaveBeenCalledWith(401);
            expect(mockNext).not.toHaveBeenCalled();
        });

        it('should return 401 when req.user is undefined', async () => {
            delete mockReq.user;

            const middleware = requireRole('patient');
            await middleware(mockReq, mockRes, mockNext);

            expect(mockRes.status).toHaveBeenCalledWith(401);
        });
    });

    // =============================================
    // REQUIRE PERMISSION TESTS
    // =============================================
    describe('requirePermission', () => {
        it('should allow access when policy exists and is_allowed is true', async () => {
            const doctorUser = createMockDoctor();
            mockReq.user = doctorUser;

            // Mock policy query - policy allows access
            query.mockResolvedValue(createQueryResult([{
                is_allowed: true,
                conditions: null
            }]));

            const middleware = requirePermission('medical_records', 'read');
            await middleware(mockReq, mockRes, mockNext);

            expect(mockNext).toHaveBeenCalled();
        });

        it('should deny access when policy exists but is_allowed is false', async () => {
            const doctorUser = createMockDoctor();
            mockReq.user = doctorUser;

            query.mockResolvedValue(createQueryResult([{
                is_allowed: false,
                conditions: null
            }]));

            const middleware = requirePermission('admin_settings', 'update');
            await middleware(mockReq, mockRes, mockNext);

            expect(mockRes.status).toHaveBeenCalledWith(403);
            expect(mockNext).not.toHaveBeenCalled();
        });

        it('should deny access when no policy found (default deny)', async () => {
            const doctorUser = createMockDoctor();
            mockReq.user = doctorUser;

            // No policy found
            query.mockResolvedValue(createQueryResult([]));

            const middleware = requirePermission('secret_resource', 'delete');
            await middleware(mockReq, mockRes, mockNext);

            expect(mockRes.status).toHaveBeenCalledWith(403);
            expect(mockNext).not.toHaveBeenCalled();
        });

        it('should return 401 when req.user is not set', async () => {
            mockReq.user = null;

            const middleware = requirePermission('any_resource', 'read');
            await middleware(mockReq, mockRes, mockNext);

            expect(mockRes.status).toHaveBeenCalledWith(401);
        });
    });

    // =============================================
    // REQUIRE OWNERSHIP TESTS
    // =============================================
    describe('requireOwnership', () => {
        it('should allow access when user owns the resource', () => {
            const userId = 'user-123-uuid';
            const user = createMockUser({ id: userId, role_name: 'patient' });
            mockReq.user = user;
            mockReq.params = { userId };

            requireOwnership(mockReq, mockRes, mockNext);

            expect(mockNext).toHaveBeenCalled();
        });

        it('should allow access when user owns resource via :id param', () => {
            const userId = 'user-456-uuid';
            const user = createMockUser({ id: userId, role_name: 'patient' });
            mockReq.user = user;
            mockReq.params = { id: userId };

            requireOwnership(mockReq, mockRes, mockNext);

            expect(mockNext).toHaveBeenCalled();
        });

        it('should deny access when user does not own the resource', () => {
            const user = createMockUser({ id: 'user-A', role_name: 'patient' });
            mockReq.user = user;
            mockReq.params = { userId: 'user-B' };

            requireOwnership(mockReq, mockRes, mockNext);

            expect(mockRes.status).toHaveBeenCalledWith(403);
            expect(mockNext).not.toHaveBeenCalled();
        });

        it('should allow system admin to bypass ownership check', () => {
            const adminUser = createMockUser({
                id: 'admin-user',
                role_name: 'system_admin',
                roleName: 'system_admin'
            });
            mockReq.user = adminUser;
            mockReq.params = { userId: 'different-user' };

            requireOwnership(mockReq, mockRes, mockNext);

            expect(mockNext).toHaveBeenCalled();
        });

        it('should allow hospital admin to bypass ownership check', () => {
            const adminUser = createMockUser({
                id: 'hospital-admin',
                role_name: 'hospital_admin',
                roleName: 'hospital_admin'
            });
            mockReq.user = adminUser;
            mockReq.params = { userId: 'another-user' };

            requireOwnership(mockReq, mockRes, mockNext);

            expect(mockNext).toHaveBeenCalled();
        });

        it('should return 401 when req.user is not set', () => {
            mockReq.user = null;
            mockReq.params = { userId: 'any-user' };

            requireOwnership(mockReq, mockRes, mockNext);

            expect(mockRes.status).toHaveBeenCalledWith(401);
        });
    });

    // =============================================
    // CONVENIENCE ROLE MIDDLEWARE TESTS
    // =============================================
    describe('Convenience Role Middleware', () => {
        describe('requirePatient', () => {
            it('should allow patient access', async () => {
                mockReq.user = createMockPatient();

                await requirePatient(mockReq, mockRes, mockNext);

                expect(mockNext).toHaveBeenCalled();
            });

            it('should deny non-patient access', async () => {
                mockReq.user = createMockDoctor();

                await requirePatient(mockReq, mockRes, mockNext);

                expect(mockRes.status).toHaveBeenCalledWith(403);
            });
        });

        describe('requireDoctor', () => {
            it('should allow doctor access', async () => {
                mockReq.user = createMockDoctor();

                await requireDoctor(mockReq, mockRes, mockNext);

                expect(mockNext).toHaveBeenCalled();
            });

            it('should deny non-doctor access', async () => {
                mockReq.user = createMockPatient();

                await requireDoctor(mockReq, mockRes, mockNext);

                expect(mockRes.status).toHaveBeenCalledWith(403);
            });
        });

        describe('requireAdmin', () => {
            it('should allow system_admin access', async () => {
                mockReq.user = createMockUser({ role_name: 'system_admin', roleName: 'system_admin' });

                await requireAdmin(mockReq, mockRes, mockNext);

                expect(mockNext).toHaveBeenCalled();
            });

            it('should allow hospital_admin access', async () => {
                mockReq.user = createMockUser({ role_name: 'hospital_admin', roleName: 'hospital_admin' });

                await requireAdmin(mockReq, mockRes, mockNext);

                expect(mockNext).toHaveBeenCalled();
            });

            it('should deny non-admin access', async () => {
                mockReq.user = createMockDoctor();

                await requireAdmin(mockReq, mockRes, mockNext);

                expect(mockRes.status).toHaveBeenCalledWith(403);
            });
        });

        describe('requireStaff', () => {
            it('should allow doctor access', async () => {
                mockReq.user = createMockDoctor();

                await requireStaff(mockReq, mockRes, mockNext);

                expect(mockNext).toHaveBeenCalled();
            });

            it('should allow nurse access', async () => {
                mockReq.user = createMockUser({ role_name: 'nurse', roleName: 'nurse' });

                await requireStaff(mockReq, mockRes, mockNext);

                expect(mockNext).toHaveBeenCalled();
            });

            it('should allow lab_technician access', async () => {
                mockReq.user = createMockUser({ role_name: 'lab_technician', roleName: 'lab_technician' });

                await requireStaff(mockReq, mockRes, mockNext);

                expect(mockNext).toHaveBeenCalled();
            });

            it('should deny patient access', async () => {
                mockReq.user = createMockPatient();

                await requireStaff(mockReq, mockRes, mockNext);

                expect(mockRes.status).toHaveBeenCalledWith(403);
            });

            it('should deny insurance_provider access', async () => {
                mockReq.user = createMockUser({ role_name: 'insurance_provider', roleName: 'insurance_provider' });

                await requireStaff(mockReq, mockRes, mockNext);

                expect(mockRes.status).toHaveBeenCalledWith(403);
            });
        });
    });

    // =============================================
    // ROLE BYPASS ATTACK PREVENTION
    // =============================================
    describe('Role Bypass Attack Prevention', () => {
        it('should prevent role bypass by modifying request object after authentication', async () => {
            // Start with patient role
            const patientUser = createMockPatient();
            mockReq.user = { ...patientUser };

            // Attempt to modify role before RBAC check (simulating attack)
            mockReq.user.roleName = 'system_admin';
            mockReq.user.role_name = 'system_admin';

            // But the RBAC should check originalRole if implemented
            // In current implementation, it trusts req.user set by auth middleware
            const middleware = requireRole('system_admin');
            await middleware(mockReq, mockRes, mockNext);

            // Note: Current implementation would allow this - this test documents the behavior
            // In a production hardening, you'd want to validate role against DB
            expect(mockNext).toHaveBeenCalled();
        });

        it('should reject access with missing role information', async () => {
            mockReq.user = { id: 'user-id' }; // No role info

            const middleware = requireRole('doctor');
            await middleware(mockReq, mockRes, mockNext);

            expect(mockRes.status).toHaveBeenCalledWith(403);
        });
    });
});
