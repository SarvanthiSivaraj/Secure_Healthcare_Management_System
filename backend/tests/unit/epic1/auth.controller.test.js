/**
 * Epic 1: Identity & Auth - Login Controller Tests
 * Tests for admin login, password validation, account locking, and session creation
 */

const { login } = require('../../../src/modules/auth/auth.controller');
const { createMockRequest, createMockResponse, createMockNext, createMockUser, ROLE_IDS } = require('../../utils/testData.factory');
const { createQueryResult } = require('../../mocks/db.mock');

// Mock dependencies
jest.mock('../../../src/config/db');
jest.mock('../../../src/models/user.model');
jest.mock('../../../src/models/patient.model');
jest.mock('../../../src/services/encryption.service');
jest.mock('../../../src/services/audit.service');
jest.mock('../../../src/services/device.service');
jest.mock('../../../src/config/jwt');

const { query } = require('../../../src/config/db');
const { findUserByEmailOrPhone, incrementFailedLoginAttempts, isAccountLocked, updateLastLogin } = require('../../../src/models/user.model');
const { findPatientByUserId } = require('../../../src/models/patient.model');
const { comparePassword, hashToken } = require('../../../src/services/encryption.service');
const { createAuditLog } = require('../../../src/services/audit.service');
const { captureDeviceInfo } = require('../../../src/services/device.service');
const { generateAccessToken, generateRefreshToken } = require('../../../src/config/jwt');

describe('Epic 1: Auth Controller - Login', () => {
    let mockReq, mockRes, mockNext;

    beforeEach(() => {
        jest.clearAllMocks();
        mockReq = createMockRequest();
        mockRes = createMockResponse();
        mockNext = createMockNext();

        // Default mock implementations
        captureDeviceInfo.mockReturnValue({ os: 'Test', browser: 'Jest' });
        hashToken.mockReturnValue('mock_hashed_token');
        generateAccessToken.mockReturnValue('mock_access_token');
        generateRefreshToken.mockReturnValue('mock_refresh_token');
        createAuditLog.mockResolvedValue({});
        updateLastLogin.mockResolvedValue({});
        query.mockResolvedValue(createQueryResult([]));
    });

    // =============================================
    // VALIDATION TESTS
    // =============================================
    describe('Input Validation', () => {
        it('should return 400 if email/phone is missing', async () => {
            mockReq.body = { password: 'Test@123' };

            await login(mockReq, mockRes);

            expect(mockRes.status).toHaveBeenCalledWith(400);
            expect(mockRes.json).toHaveBeenCalledWith(
                expect.objectContaining({
                    success: false,
                    message: expect.stringContaining('required')
                })
            );
        });

        it('should return 400 if password is missing', async () => {
            mockReq.body = { emailOrPhone: 'admin@healthcare.com' };

            await login(mockReq, mockRes);

            expect(mockRes.status).toHaveBeenCalledWith(400);
            expect(mockRes.json).toHaveBeenCalledWith(
                expect.objectContaining({
                    success: false,
                    message: expect.stringContaining('required')
                })
            );
        });

        it('should accept email in "email" field for frontend compatibility', async () => {
            mockReq.body = { email: 'admin@healthcare.com', password: 'Test@123' };

            const adminUser = createMockUser({
                email: 'admin@healthcare.com',
                role_id: ROLE_IDS.hospital_admin,
                role_name: 'hospital_admin',
                is_verified: true,
                status: 'active'
            });

            findUserByEmailOrPhone.mockResolvedValue(adminUser);
            isAccountLocked.mockResolvedValue(false);
            comparePassword.mockResolvedValue(true);

            await login(mockReq, mockRes);

            expect(findUserByEmailOrPhone).toHaveBeenCalledWith('admin@healthcare.com');
        });
    });

    // =============================================
    // ADMIN LOGIN TESTS
    // =============================================
    describe('Admin Login Scenarios', () => {
        it('should successfully login hospital admin with valid credentials', async () => {
            mockReq.body = { emailOrPhone: 'admin@healthcare.com', password: 'SecureAdmin@123' };

            const adminUser = createMockUser({
                id: 'admin-uuid-123',
                email: 'admin@healthcare.com',
                role_id: ROLE_IDS.hospital_admin,
                role_name: 'hospital_admin',
                first_name: 'Admin',
                last_name: 'User',
                is_verified: true,
                status: 'active'
            });

            findUserByEmailOrPhone.mockResolvedValue(adminUser);
            isAccountLocked.mockResolvedValue(false);
            comparePassword.mockResolvedValue(true);

            await login(mockReq, mockRes);

            expect(mockRes.status).toHaveBeenCalledWith(200);
            expect(mockRes.json).toHaveBeenCalledWith(
                expect.objectContaining({
                    success: true,
                    data: expect.objectContaining({
                        user: expect.objectContaining({
                            email: 'admin@healthcare.com',
                            role: 'hospital_admin'
                        }),
                        accessToken: 'mock_access_token',
                        refreshToken: 'mock_refresh_token'
                    })
                })
            );
        });

        it('should successfully login system admin', async () => {
            mockReq.body = { emailOrPhone: 'sysadmin@healthcare.com', password: 'SysAdmin@123' };

            const sysAdminUser = createMockUser({
                id: 'sysadmin-uuid',
                email: 'sysadmin@healthcare.com',
                role_id: ROLE_IDS.system_admin,
                role_name: 'system_admin',
                is_verified: true,
                status: 'active'
            });

            findUserByEmailOrPhone.mockResolvedValue(sysAdminUser);
            isAccountLocked.mockResolvedValue(false);
            comparePassword.mockResolvedValue(true);

            await login(mockReq, mockRes);

            expect(mockRes.status).toHaveBeenCalledWith(200);
            expect(mockRes.json).toHaveBeenCalledWith(
                expect.objectContaining({
                    success: true,
                    data: expect.objectContaining({
                        user: expect.objectContaining({
                            role: 'system_admin'
                        })
                    })
                })
            );
        });

        it('should create session with device info for admin login', async () => {
            mockReq.body = { emailOrPhone: 'admin@healthcare.com', password: 'Admin@123' };
            mockReq.ip = '192.168.1.100';
            mockReq.headers['user-agent'] = 'Mozilla/5.0 Admin Browser';

            const adminUser = createMockUser({
                email: 'admin@healthcare.com',
                role_id: ROLE_IDS.hospital_admin,
                role_name: 'hospital_admin',
                is_verified: true,
                status: 'active'
            });

            findUserByEmailOrPhone.mockResolvedValue(adminUser);
            isAccountLocked.mockResolvedValue(false);
            comparePassword.mockResolvedValue(true);

            await login(mockReq, mockRes);

            // Verify session creation
            expect(query).toHaveBeenCalledWith(
                expect.stringContaining('INSERT INTO sessions'),
                expect.arrayContaining([
                    adminUser.id,
                    expect.any(String), // token_hash
                    expect.any(String), // refresh_token_hash
                    '192.168.1.100',
                    'Mozilla/5.0 Admin Browser',
                    expect.any(String)  // device_info JSON
                ])
            );
        });
    });

    // =============================================
    // AUTHENTICATION FAILURE TESTS
    // =============================================
    describe('Authentication Failures', () => {
        it('should return 401 for non-existent user', async () => {
            mockReq.body = { emailOrPhone: 'nonexistent@test.com', password: 'Test@123' };
            findUserByEmailOrPhone.mockResolvedValue(null);

            await login(mockReq, mockRes);

            expect(mockRes.status).toHaveBeenCalledWith(401);
            expect(mockRes.json).toHaveBeenCalledWith(
                expect.objectContaining({
                    success: false,
                    message: expect.stringContaining('Invalid')
                })
            );
        });

        it('should return 401 for incorrect password', async () => {
            mockReq.body = { emailOrPhone: 'admin@healthcare.com', password: 'WrongPassword@123' };

            const adminUser = createMockUser({
                email: 'admin@healthcare.com',
                role_id: ROLE_IDS.hospital_admin,
                role_name: 'hospital_admin'
            });

            findUserByEmailOrPhone.mockResolvedValue(adminUser);
            isAccountLocked.mockResolvedValue(false);
            comparePassword.mockResolvedValue(false); // Wrong password

            await login(mockReq, mockRes);

            expect(mockRes.status).toHaveBeenCalledWith(401);
            expect(mockRes.json).toHaveBeenCalledWith(
                expect.objectContaining({
                    success: false,
                    message: expect.stringContaining('Invalid')
                })
            );
        });

        it('should increment failed login attempts on wrong password', async () => {
            mockReq.body = { emailOrPhone: 'admin@healthcare.com', password: 'WrongPassword' };

            const adminUser = createMockUser({ email: 'admin@healthcare.com' });
            findUserByEmailOrPhone.mockResolvedValue(adminUser);
            isAccountLocked.mockResolvedValue(false);
            comparePassword.mockResolvedValue(false);

            await login(mockReq, mockRes);

            expect(incrementFailedLoginAttempts).toHaveBeenCalledWith(adminUser.id);
        });

        it('should create audit log for failed login attempt', async () => {
            mockReq.body = { emailOrPhone: 'admin@healthcare.com', password: 'Wrong@123' };

            const adminUser = createMockUser({ email: 'admin@healthcare.com' });
            findUserByEmailOrPhone.mockResolvedValue(adminUser);
            isAccountLocked.mockResolvedValue(false);
            comparePassword.mockResolvedValue(false);

            await login(mockReq, mockRes);

            expect(createAuditLog).toHaveBeenCalledWith(
                expect.objectContaining({
                    userId: adminUser.id,
                    action: 'failed_login',
                    purpose: 'Invalid password'
                })
            );
        });
    });

    // =============================================
    // ACCOUNT STATUS TESTS
    // =============================================
    describe('Account Status Checks', () => {
        it('should return 403 for locked account', async () => {
            mockReq.body = { emailOrPhone: 'locked@healthcare.com', password: 'Test@123' };

            const lockedUser = createMockUser({
                email: 'locked@healthcare.com',
                failed_login_attempts: 5
            });

            findUserByEmailOrPhone.mockResolvedValue(lockedUser);
            isAccountLocked.mockResolvedValue(true); // Account is locked

            await login(mockReq, mockRes);

            expect(mockRes.status).toHaveBeenCalledWith(403);
            expect(mockRes.json).toHaveBeenCalledWith(
                expect.objectContaining({
                    success: false,
                    message: expect.stringContaining('locked')
                })
            );
        });

        it('should return 403 for unverified account', async () => {
            mockReq.body = { emailOrPhone: 'unverified@healthcare.com', password: 'Test@123' };

            const unverifiedUser = createMockUser({
                email: 'unverified@healthcare.com',
                is_verified: false // Not verified
            });

            findUserByEmailOrPhone.mockResolvedValue(unverifiedUser);
            isAccountLocked.mockResolvedValue(false);
            comparePassword.mockResolvedValue(true);

            await login(mockReq, mockRes);

            expect(mockRes.status).toHaveBeenCalledWith(403);
            expect(mockRes.json).toHaveBeenCalledWith(
                expect.objectContaining({
                    success: false,
                    message: expect.stringContaining('verified')
                })
            );
        });

        it('should allow login only for active verified accounts', async () => {
            mockReq.body = { emailOrPhone: 'active@healthcare.com', password: 'Test@123' };

            const activeUser = createMockUser({
                email: 'active@healthcare.com',
                is_verified: true,
                status: 'active'
            });

            findUserByEmailOrPhone.mockResolvedValue(activeUser);
            isAccountLocked.mockResolvedValue(false);
            comparePassword.mockResolvedValue(true);

            await login(mockReq, mockRes);

            expect(mockRes.status).toHaveBeenCalledWith(200);
        });
    });

    // =============================================
    // PATIENT-SPECIFIC TESTS
    // =============================================
    describe('Patient Login with Health ID', () => {
        it('should include unique health ID for patient login', async () => {
            mockReq.body = { emailOrPhone: 'patient@test.com', password: 'Patient@123' };

            const patientUser = createMockUser({
                id: 'patient-uuid',
                email: 'patient@test.com',
                role_id: ROLE_IDS.patient,
                role_name: 'patient',
                is_verified: true,
                status: 'active'
            });

            const patientProfile = {
                unique_health_id: 'UHI-12345678'
            };

            findUserByEmailOrPhone.mockResolvedValue(patientUser);
            isAccountLocked.mockResolvedValue(false);
            comparePassword.mockResolvedValue(true);
            findPatientByUserId.mockResolvedValue(patientProfile);

            await login(mockReq, mockRes);

            expect(findPatientByUserId).toHaveBeenCalledWith('patient-uuid');
            expect(mockRes.json).toHaveBeenCalledWith(
                expect.objectContaining({
                    data: expect.objectContaining({
                        user: expect.objectContaining({
                            uniqueHealthId: 'UHI-12345678'
                        })
                    })
                })
            );
        });

        it('should handle patient login even if profile is missing', async () => {
            mockReq.body = { emailOrPhone: 'patient@test.com', password: 'Patient@123' };

            const patientUser = createMockUser({
                role_id: ROLE_IDS.patient,
                role_name: 'patient',
                is_verified: true,
                status: 'active'
            });

            findUserByEmailOrPhone.mockResolvedValue(patientUser);
            isAccountLocked.mockResolvedValue(false);
            comparePassword.mockResolvedValue(true);
            findPatientByUserId.mockResolvedValue(null); // No profile

            await login(mockReq, mockRes);

            expect(mockRes.status).toHaveBeenCalledWith(200);
            expect(mockRes.json).toHaveBeenCalledWith(
                expect.objectContaining({
                    data: expect.objectContaining({
                        user: expect.objectContaining({
                            uniqueHealthId: null
                        })
                    })
                })
            );
        });
    });

    // =============================================
    // TOKEN GENERATION TESTS
    // =============================================
    describe('Token Generation', () => {
        it('should generate both access and refresh tokens', async () => {
            mockReq.body = { emailOrPhone: 'user@test.com', password: 'Test@123' };

            const user = createMockUser({
                email: 'user@test.com',
                is_verified: true,
                status: 'active'
            });

            findUserByEmailOrPhone.mockResolvedValue(user);
            isAccountLocked.mockResolvedValue(false);
            comparePassword.mockResolvedValue(true);

            await login(mockReq, mockRes);

            expect(generateAccessToken).toHaveBeenCalledWith(
                expect.objectContaining({
                    userId: user.id,
                    email: user.email,
                    roleId: user.role_id,
                    roleName: user.role_name
                })
            );

            expect(generateRefreshToken).toHaveBeenCalledWith(
                expect.objectContaining({
                    userId: user.id
                })
            );
        });

        it('should hash tokens before storing in session', async () => {
            mockReq.body = { emailOrPhone: 'user@test.com', password: 'Test@123' };

            const user = createMockUser({ is_verified: true, status: 'active' });
            findUserByEmailOrPhone.mockResolvedValue(user);
            isAccountLocked.mockResolvedValue(false);
            comparePassword.mockResolvedValue(true);

            await login(mockReq, mockRes);

            expect(hashToken).toHaveBeenCalledWith('mock_access_token');
            expect(hashToken).toHaveBeenCalledWith('mock_refresh_token');
        });
    });

    // =============================================
    // AUDIT LOG TESTS
    // =============================================
    describe('Audit Logging', () => {
        it('should create audit log for successful login', async () => {
            mockReq.body = { emailOrPhone: 'admin@healthcare.com', password: 'Admin@123' };
            mockReq.ip = '10.0.0.1';
            mockReq.method = 'POST';
            mockReq.path = '/api/auth/login';

            const adminUser = createMockUser({
                email: 'admin@healthcare.com',
                is_verified: true,
                status: 'active'
            });

            findUserByEmailOrPhone.mockResolvedValue(adminUser);
            isAccountLocked.mockResolvedValue(false);
            comparePassword.mockResolvedValue(true);

            await login(mockReq, mockRes);

            expect(createAuditLog).toHaveBeenCalledWith(
                expect.objectContaining({
                    userId: adminUser.id,
                    action: expect.stringContaining('login'),
                    purpose: 'User login',
                    ipAddress: '10.0.0.1',
                    requestMethod: 'POST',
                    requestPath: '/api/auth/login',
                    statusCode: 200
                })
            );
        });
    });

    // =============================================
    // ERROR HANDLING TESTS
    // =============================================
    describe('Error Handling', () => {
        it('should handle database errors gracefully', async () => {
            mockReq.body = { emailOrPhone: 'user@test.com', password: 'Test@123' };

            findUserByEmailOrPhone.mockRejectedValue(new Error('Database connection failed'));

            await login(mockReq, mockRes);

            expect(mockRes.status).toHaveBeenCalledWith(500);
            expect(mockRes.json).toHaveBeenCalledWith(
                expect.objectContaining({
                    success: false,
                    message: expect.stringContaining('Internal')
                })
            );
        });

        it('should not expose password hash in error responses', async () => {
            mockReq.body = { emailOrPhone: 'user@test.com', password: 'Test@123' };

            const user = createMockUser({ password_hash: '$2b$10$secrethash' });
            findUserByEmailOrPhone.mockResolvedValue(user);
            isAccountLocked.mockRejectedValue(new Error('Error'));

            await login(mockReq, mockRes);

            const responseJson = mockRes.json.mock.calls[0][0];
            expect(JSON.stringify(responseJson)).not.toContain('password_hash');
            expect(JSON.stringify(responseJson)).not.toContain('$2b$10$');
        });
    });
});
