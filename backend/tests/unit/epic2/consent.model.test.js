/**
 * Epic 2: Consent Management - Consent Model Tests
 * Tests for checkConsent function covering active, expired, and revoked scenarios
 */

const {
    createConsent,
    revokeConsent,
    getActiveConsents,
    checkConsent,
    findConsentById
} = require('../../../src/models/consent.model');
const { createQueryResult } = require('../../mocks/db.mock');
const { generateUserId } = require('../../mocks/jwt.mock');

// Mock database
jest.mock('../../../src/config/db');

const { query } = require('../../../src/config/db');

describe('Epic 2: Consent Model', () => {
    beforeEach(() => {
        jest.clearAllMocks();
    });

    // =============================================
    // CHECK CONSENT FUNCTION TESTS
    // =============================================
    describe('checkConsent', () => {
        it('should return true when active consent exists with matching category', async () => {
            const patientId = generateUserId();
            const recipientId = generateUserId();

            // Consent exists
            query.mockResolvedValue(createQueryResult([{ '?column?': 1 }]));

            const result = await checkConsent(patientId, recipientId, 'ALL_RECORDS', 'read');

            expect(result).toBe(true);
            expect(query).toHaveBeenCalledWith(
                expect.stringContaining('SELECT 1'),
                expect.arrayContaining([patientId, recipientId, 'ALL_RECORDS', 'read'])
            );
        });

        it('should return false when no consent exists', async () => {
            const patientId = generateUserId();
            const recipientId = generateUserId();

            // No consent found
            query.mockResolvedValue(createQueryResult([]));

            const result = await checkConsent(patientId, recipientId, 'LAB_RESULTS', 'read');

            expect(result).toBe(false);
        });

        it('should return false when consent is expired (end_time in past)', async () => {
            const patientId = generateUserId();
            const recipientId = generateUserId();

            // Query includes end_time check, returns empty for expired
            query.mockResolvedValue(createQueryResult([]));

            const result = await checkConsent(patientId, recipientId, 'DIAGNOSES', 'read');

            expect(result).toBe(false);
            // Verify query includes time check
            expect(query).toHaveBeenCalledWith(
                expect.stringContaining('end_time'),
                expect.any(Array)
            );
        });

        it('should return false when consent status is not active', async () => {
            const patientId = generateUserId();
            const recipientId = generateUserId();

            // Query includes status check, returns empty for non-active
            query.mockResolvedValue(createQueryResult([]));

            const result = await checkConsent(patientId, recipientId, 'PRESCRIPTIONS', 'read');

            expect(result).toBe(false);
            expect(query).toHaveBeenCalledWith(
                expect.stringContaining("status = 'active'"),
                expect.any(Array)
            );
        });

        it('should grant read access when consent has write level (write includes read)', async () => {
            const patientId = generateUserId();
            const recipientId = generateUserId();

            // Write consent exists, should grant read access
            query.mockResolvedValue(createQueryResult([{ '?column?': 1 }]));

            const result = await checkConsent(patientId, recipientId, 'ALL_RECORDS', 'read');

            expect(result).toBe(true);
            // Verify query handles write granting read
            expect(query).toHaveBeenCalledWith(
                expect.stringContaining("access_level = 'write'"),
                expect.any(Array)
            );
        });

        it('should default to read access level when not specified', async () => {
            const patientId = generateUserId();
            const recipientId = generateUserId();

            query.mockResolvedValue(createQueryResult([{ '?column?': 1 }]));

            const result = await checkConsent(patientId, recipientId, 'IMAGING');

            expect(result).toBe(true);
            expect(query).toHaveBeenCalledWith(
                expect.any(String),
                expect.arrayContaining(['read'])
            );
        });

        it('should throw error on database failure', async () => {
            const patientId = generateUserId();
            const recipientId = generateUserId();

            query.mockRejectedValue(new Error('Database connection failed'));

            await expect(checkConsent(patientId, recipientId, 'ALL_RECORDS', 'read'))
                .rejects.toThrow('Database connection failed');
        });
    });

    // =============================================
    // CREATE CONSENT TESTS
    // =============================================
    describe('createConsent', () => {
        it('should create consent with all required fields', async () => {
            const consentData = {
                patientId: generateUserId(),
                recipientUserId: generateUserId(),
                dataCategory: 'ALL_RECORDS',
                purpose: 'TREATMENT',
                accessLevel: 'read'
            };

            const createdConsent = {
                id: generateUserId(),
                ...consentData,
                status: 'active',
                created_at: new Date().toISOString()
            };

            query.mockResolvedValue(createQueryResult([createdConsent]));

            const result = await createConsent(consentData);

            expect(result).toEqual(createdConsent);
            expect(query).toHaveBeenCalledWith(
                expect.stringContaining('INSERT INTO consents'),
                expect.any(Array)
            );
        });

        it('should create consent with optional end_time', async () => {
            const futureDate = new Date(Date.now() + 86400000).toISOString();
            const consentData = {
                patientId: generateUserId(),
                recipientUserId: generateUserId(),
                dataCategory: 'DIAGNOSES',
                purpose: 'TREATMENT',
                accessLevel: 'write',
                endTime: futureDate
            };

            const createdConsent = { id: generateUserId(), ...consentData };
            query.mockResolvedValue(createQueryResult([createdConsent]));

            const result = await createConsent(consentData);

            expect(result).toBeDefined();
        });
    });

    // =============================================
    // REVOKE CONSENT TESTS
    // =============================================
    describe('revokeConsent', () => {
        it('should revoke consent by updating status', async () => {
            const consentId = generateUserId();
            const patientId = generateUserId();

            const revokedConsent = {
                id: consentId,
                patient_id: patientId,
                status: 'revoked',
                updated_at: new Date().toISOString()
            };

            query.mockResolvedValue(createQueryResult([revokedConsent]));

            const result = await revokeConsent(consentId, patientId);

            expect(result.status).toBe('revoked');
            expect(query).toHaveBeenCalledWith(
                expect.stringContaining("status = 'revoked'"),
                expect.arrayContaining([consentId, patientId])
            );
        });

        it('should return undefined when consent not found or patient mismatch', async () => {
            const consentId = generateUserId();
            const wrongPatientId = generateUserId();

            query.mockResolvedValue(createQueryResult([]));

            const result = await revokeConsent(consentId, wrongPatientId);

            expect(result).toBeUndefined();
        });
    });

    // =============================================
    // GET ACTIVE CONSENTS TESTS
    // =============================================
    describe('getActiveConsents', () => {
        it('should return active consents for patient', async () => {
            const patientId = generateUserId();
            const consents = [
                {
                    id: generateUserId(),
                    patient_id: patientId,
                    data_category: 'ALL_RECORDS',
                    status: 'active'
                },
                {
                    id: generateUserId(),
                    patient_id: patientId,
                    data_category: 'LAB_RESULTS',
                    status: 'active'
                }
            ];

            query.mockResolvedValue(createQueryResult(consents));

            const result = await getActiveConsents(patientId);

            expect(result).toHaveLength(2);
            expect(query).toHaveBeenCalledWith(
                expect.stringContaining("status = 'active'"),
                expect.arrayContaining([patientId])
            );
        });

        it('should return empty array when no active consents', async () => {
            const patientId = generateUserId();

            query.mockResolvedValue(createQueryResult([]));

            const result = await getActiveConsents(patientId);

            expect(result).toEqual([]);
        });

        it('should filter out expired consents', async () => {
            const patientId = generateUserId();

            query.mockResolvedValue(createQueryResult([]));

            await getActiveConsents(patientId);

            // Verify query excludes expired
            expect(query).toHaveBeenCalledWith(
                expect.stringContaining('end_time'),
                expect.any(Array)
            );
        });
    });

    // =============================================
    // FIND CONSENT BY ID TESTS
    // =============================================
    describe('findConsentById', () => {
        it('should return consent when found', async () => {
            const consentId = generateUserId();
            const consent = {
                id: consentId,
                patient_id: generateUserId(),
                data_category: 'ALL_RECORDS',
                status: 'active'
            };

            query.mockResolvedValue(createQueryResult([consent]));

            const result = await findConsentById(consentId);

            expect(result).toEqual(consent);
        });

        it('should return undefined when consent not found', async () => {
            const consentId = generateUserId();

            query.mockResolvedValue(createQueryResult([]));

            const result = await findConsentById(consentId);

            expect(result).toBeUndefined();
        });
    });
});
