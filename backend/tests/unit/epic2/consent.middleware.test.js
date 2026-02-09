/**
 * Epic 2: Consent Management - Consent Middleware Tests
 * Tests for access without consent, expired consent, and locked record scenarios
 */

const { verifyConsent } = require('../../../src/middleware/consent.middleware');
const {
    createMockRequest,
    createMockResponse,
    createMockNext,
    createMockDoctor,
    createMockPatient,
    createMockUser
} = require('../../utils/testData.factory');

// Mock dependencies
jest.mock('../../../src/models/consent.model');
jest.mock('../../../src/config/db');
jest.mock('../../../src/services/shift.service');

const { checkConsent } = require('../../../src/models/consent.model');
const { isOnShift } = require('../../../src/services/shift.service');

describe('Epic 2: Consent Middleware', () => {
    let mockReq, mockRes, mockNext;

    beforeEach(() => {
        jest.clearAllMocks();
        mockReq = createMockRequest();
        mockRes = createMockResponse();
        mockNext = createMockNext();

        // Default: staff is on shift
        isOnShift.mockResolvedValue(true);
    });

    // =============================================
    // ACCESS WITHOUT CONSENT TESTS
    // =============================================
    describe('Access Without Consent', () => {
        it('should deny doctor access to patient data without consent', async () => {
            const doctor = createMockDoctor();
            const patientId = 'patient-123';

            mockReq.user = { ...doctor, role_name: 'doctor' };
            mockReq.params = { patientId };

            // No consent exists
            checkConsent.mockResolvedValue(false);

            const middleware = verifyConsent('ALL_RECORDS', 'read');
            await middleware(mockReq, mockRes, mockNext);

            expect(mockRes.status).toHaveBeenCalledWith(403);
            expect(mockRes.json).toHaveBeenCalledWith(
                expect.objectContaining({
                    success: false,
                    message: expect.stringContaining('consent')
                })
            );
            expect(mockNext).not.toHaveBeenCalled();
        });

        it('should deny nurse access to patient data without consent', async () => {
            const nurse = createMockUser({ role_name: 'nurse', roleName: 'nurse' });
            const patientId = 'patient-456';

            mockReq.user = nurse;
            mockReq.params = { patientId };

            checkConsent.mockResolvedValue(false);

            const middleware = verifyConsent('LAB_RESULTS', 'read');
            await middleware(mockReq, mockRes, mockNext);

            expect(mockRes.status).toHaveBeenCalledWith(403);
            expect(mockNext).not.toHaveBeenCalled();
        });

        it('should deny access when consent exists for different data category', async () => {
            const doctor = createMockDoctor();
            const patientId = 'patient-789';

            mockReq.user = { ...doctor, role_name: 'doctor' };
            mockReq.params = { patientId };

            // Consent for different category
            checkConsent.mockResolvedValue(false);

            const middleware = verifyConsent('IMAGING', 'read');
            await middleware(mockReq, mockRes, mockNext);

            expect(mockRes.status).toHaveBeenCalledWith(403);
        });

        it('should allow access when valid consent exists', async () => {
            const doctor = createMockDoctor();
            const patientId = 'patient-with-consent';

            mockReq.user = { ...doctor, role_name: 'doctor' };
            mockReq.params = { patientId };

            // Consent exists
            checkConsent.mockResolvedValue(true);

            const middleware = verifyConsent('ALL_RECORDS', 'read');
            await middleware(mockReq, mockRes, mockNext);

            expect(mockNext).toHaveBeenCalled();
            expect(mockReq.consentVerified).toBe(true);
        });

        it('should deny non-healthcare role access to patient data', async () => {
            const insuranceUser = createMockUser({
                role_name: 'insurance_provider',
                roleName: 'insurance_provider'
            });
            const patientId = 'patient-123';

            mockReq.user = insuranceUser;
            mockReq.params = { patientId };

            const middleware = verifyConsent('ALL_RECORDS', 'read');
            await middleware(mockReq, mockRes, mockNext);

            expect(mockRes.status).toHaveBeenCalledWith(403);
            expect(mockRes.json).toHaveBeenCalledWith(
                expect.objectContaining({
                    message: expect.stringContaining('healthcare provider')
                })
            );
        });

        it('should return 400 when patientId is not provided', async () => {
            const doctor = createMockDoctor();
            mockReq.user = { ...doctor, role_name: 'doctor' };
            mockReq.params = {}; // No patientId

            const middleware = verifyConsent('ALL_RECORDS', 'read');
            await middleware(mockReq, mockRes, mockNext);

            expect(mockRes.status).toHaveBeenCalledWith(400);
            expect(mockRes.json).toHaveBeenCalledWith(
                expect.objectContaining({
                    message: expect.stringContaining('Patient ID')
                })
            );
        });
    });

    // =============================================
    // PATIENT SELF-ACCESS TESTS
    // =============================================
    describe('Patient Self-Access', () => {
        it('should allow patient to access their own data without consent check', async () => {
            const patientId = 'patient-self';
            const patient = createMockPatient({ id: patientId });

            mockReq.user = { ...patient, role_name: 'patient' };
            mockReq.params = { patientId };

            const middleware = verifyConsent('ALL_RECORDS', 'read');
            await middleware(mockReq, mockRes, mockNext);

            expect(mockNext).toHaveBeenCalled();
            // checkConsent should not be called for self-access
            expect(checkConsent).not.toHaveBeenCalled();
        });

        it('should deny patient access to other patient data', async () => {
            const patient = createMockPatient({ id: 'patient-A' });

            mockReq.user = { ...patient, role_name: 'patient' };
            mockReq.params = { patientId: 'patient-B' };

            const middleware = verifyConsent('ALL_RECORDS', 'read');
            await middleware(mockReq, mockRes, mockNext);

            expect(mockRes.status).toHaveBeenCalledWith(403);
            expect(mockNext).not.toHaveBeenCalled();
        });
    });

    // =============================================
    // EXPIRED CONSENT TESTS
    // =============================================
    describe('Expired Consent Handling', () => {
        it('should deny access when consent has expired (checkConsent returns false)', async () => {
            const doctor = createMockDoctor();
            const patientId = 'patient-expired-consent';

            mockReq.user = { ...doctor, role_name: 'doctor' };
            mockReq.params = { patientId };

            // checkConsent handles expiration internally and returns false
            checkConsent.mockResolvedValue(false);

            const middleware = verifyConsent('DIAGNOSES', 'read');
            await middleware(mockReq, mockRes, mockNext);

            expect(mockRes.status).toHaveBeenCalledWith(403);
            expect(mockRes.json).toHaveBeenCalledWith(
                expect.objectContaining({
                    message: expect.stringContaining('consent')
                })
            );
        });

        it('should allow access with non-expired consent', async () => {
            const doctor = createMockDoctor();
            const patientId = 'patient-valid-consent';

            mockReq.user = { ...doctor, role_name: 'doctor' };
            mockReq.params = { patientId };

            // Valid non-expired consent
            checkConsent.mockResolvedValue(true);

            const middleware = verifyConsent('PRESCRIPTIONS', 'read');
            await middleware(mockReq, mockRes, mockNext);

            expect(mockNext).toHaveBeenCalled();
        });
    });

    // =============================================
    // SHIFT-BASED ACCESS TESTS
    // =============================================
    describe('Shift-Based Access Control', () => {
        it('should allow on-shift staff access with valid consent', async () => {
            const doctor = createMockDoctor();
            const patientId = 'patient-123';

            mockReq.user = { ...doctor, role_name: 'doctor' };
            mockReq.params = { patientId };

            isOnShift.mockResolvedValue(true);
            checkConsent.mockResolvedValue(true);

            const middleware = verifyConsent('ALL_RECORDS', 'read');
            await middleware(mockReq, mockRes, mockNext);

            expect(mockNext).toHaveBeenCalled();
            expect(mockReq.offShiftAccess).toBeUndefined();
        });

        it('should flag off-shift access but still allow with consent', async () => {
            const doctor = createMockDoctor();
            const patientId = 'patient-456';

            mockReq.user = { ...doctor, role_name: 'doctor' };
            mockReq.params = { patientId };

            isOnShift.mockResolvedValue(false);
            checkConsent.mockResolvedValue(true);

            const middleware = verifyConsent('ALL_RECORDS', 'read');
            await middleware(mockReq, mockRes, mockNext);

            expect(mockNext).toHaveBeenCalled();
            expect(mockReq.offShiftAccess).toBe(true);
        });

        it('should allow emergency access override for off-shift staff', async () => {
            const doctor = createMockDoctor();
            const patientId = 'emergency-patient';

            mockReq.user = { ...doctor, role_name: 'doctor' };
            mockReq.params = { patientId };
            mockReq.emergencyAccess = true; // Emergency override

            isOnShift.mockResolvedValue(false);
            checkConsent.mockResolvedValue(true);

            const middleware = verifyConsent('ALL_RECORDS', 'read');
            await middleware(mockReq, mockRes, mockNext);

            expect(mockNext).toHaveBeenCalled();
            expect(mockReq.offShiftAccess).toBeUndefined();
        });
    });

    // =============================================
    // ACCESS LEVEL TESTS
    // =============================================
    describe('Access Level Verification', () => {
        it('should verify consent for read access level', async () => {
            const doctor = createMockDoctor();
            const patientId = 'patient-123';

            mockReq.user = { ...doctor, role_name: 'doctor' };
            mockReq.params = { patientId };

            checkConsent.mockResolvedValue(true);

            const middleware = verifyConsent('LAB_RESULTS', 'read');
            await middleware(mockReq, mockRes, mockNext);

            expect(checkConsent).toHaveBeenCalledWith(
                patientId,
                doctor.id,
                'LAB_RESULTS',
                'read'
            );
        });

        it('should verify consent for write access level', async () => {
            const doctor = createMockDoctor();
            const patientId = 'patient-456';

            mockReq.user = { ...doctor, role_name: 'doctor' };
            mockReq.params = { patientId };

            checkConsent.mockResolvedValue(true);

            const middleware = verifyConsent('DIAGNOSES', 'write');
            await middleware(mockReq, mockRes, mockNext);

            expect(checkConsent).toHaveBeenCalledWith(
                patientId,
                doctor.id,
                'DIAGNOSES',
                'write'
            );
        });
    });

    // =============================================
    // ERROR HANDLING
    // =============================================
    describe('Error Handling', () => {
        it('should return 500 on consent check error', async () => {
            const doctor = createMockDoctor();
            mockReq.user = { ...doctor, role_name: 'doctor' };
            mockReq.params = { patientId: 'patient-error' };

            checkConsent.mockRejectedValue(new Error('Database error'));

            const middleware = verifyConsent('ALL_RECORDS', 'read');
            await middleware(mockReq, mockRes, mockNext);

            expect(mockRes.status).toHaveBeenCalledWith(500);
        });
    });
});
