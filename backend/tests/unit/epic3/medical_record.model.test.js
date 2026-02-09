/**
 * Epic 3: EMR - Medical Record Model Tests
 * Tests for immutable record edits, visit linkage, and CRUD operations
 */

const MedicalRecordModel = require('../../../src/models/medical_record.model');
const { createQueryResult } = require('../../mocks/db.mock');
const {
    generateUserId
} = require('../../mocks/jwt.mock');
const {
    createMockMedicalRecord,
    createImmutableMedicalRecord,
    createMockVisit,
    createCompletedVisit,
    createCancelledVisit
} = require('../../utils/testData.factory');

// Mock database
jest.mock('../../../src/config/db');

const pool = require('../../../src/config/db');

describe('Epic 3: Medical Record Model', () => {
    beforeEach(() => {
        jest.clearAllMocks();
    });

    // =============================================
    // IMMUTABLE EDIT ATTEMPT TESTS
    // =============================================
    describe('Immutable Record Edit Prevention', () => {
        it('should throw error when attempting to update immutable record', async () => {
            const recordId = generateUserId();
            const immutableRecord = createImmutableMedicalRecord({ id: recordId });

            // First query checks immutable flag
            pool.query.mockResolvedValueOnce(createQueryResult([{ immutable_flag: true }]));

            await expect(MedicalRecordModel.update(recordId, {
                title: 'Attempted Edit',
                description: 'This should fail'
            })).rejects.toThrow('Cannot update immutable medical record');

            // Verify only the check query was made, not the update
            expect(pool.query).toHaveBeenCalledTimes(1);
            expect(pool.query).toHaveBeenCalledWith(
                expect.stringContaining('immutable_flag'),
                [recordId]
            );
        });

        it('should allow update when record is mutable', async () => {
            const recordId = generateUserId();
            const mutableRecord = createMockMedicalRecord({
                id: recordId,
                immutable_flag: false
            });

            // Check query returns mutable record
            pool.query.mockResolvedValueOnce(createQueryResult([{ immutable_flag: false }]));
            // Update query returns updated record
            pool.query.mockResolvedValueOnce(createQueryResult([{
                ...mutableRecord,
                title: 'Updated Title',
                description: 'Updated Description'
            }]));

            const result = await MedicalRecordModel.update(recordId, {
                title: 'Updated Title',
                description: 'Updated Description'
            });

            expect(result.title).toBe('Updated Title');
            expect(pool.query).toHaveBeenCalledTimes(2);
        });

        it('should throw error when record not found during update', async () => {
            const nonExistentId = generateUserId();

            // No record found
            pool.query.mockResolvedValueOnce(createQueryResult([]));

            await expect(MedicalRecordModel.update(nonExistentId, {
                title: 'New Title'
            })).rejects.toThrow('Medical record not found');
        });

        it('should handle partial updates (title only)', async () => {
            const recordId = generateUserId();

            pool.query.mockResolvedValueOnce(createQueryResult([{ immutable_flag: false }]));
            pool.query.mockResolvedValueOnce(createQueryResult([{
                id: recordId,
                title: 'Only Title Updated',
                description: 'Original Description'
            }]));

            const result = await MedicalRecordModel.update(recordId, {
                title: 'Only Title Updated'
            });

            expect(result.title).toBe('Only Title Updated');
        });

        it('should handle partial updates (description only)', async () => {
            const recordId = generateUserId();

            pool.query.mockResolvedValueOnce(createQueryResult([{ immutable_flag: false }]));
            pool.query.mockResolvedValueOnce(createQueryResult([{
                id: recordId,
                title: 'Original Title',
                description: 'Only Description Updated'
            }]));

            const result = await MedicalRecordModel.update(recordId, {
                description: 'Only Description Updated'
            });

            expect(result.description).toBe('Only Description Updated');
        });
    });

    // =============================================
    // VISIT LINKAGE VALIDATION TESTS
    // =============================================
    describe('Visit Linkage Validation', () => {
        it('should reject record creation for cancelled visit', async () => {
            const cancelledVisit = createCancelledVisit();

            pool.query.mockResolvedValueOnce(createQueryResult([{
                id: cancelledVisit.id,
                status: 'cancelled'
            }]));

            await expect(MedicalRecordModel.validateVisitLinkage(cancelledVisit.id))
                .rejects.toThrow('Cannot create medical record for cancelled or no-show visit');
        });

        it('should reject record creation for no-show visit', async () => {
            const noShowVisit = createMockVisit({ status: 'no_show' });

            pool.query.mockResolvedValueOnce(createQueryResult([{
                id: noShowVisit.id,
                status: 'no_show'
            }]));

            await expect(MedicalRecordModel.validateVisitLinkage(noShowVisit.id))
                .rejects.toThrow('Cannot create medical record for cancelled or no-show visit');
        });

        it('should allow record creation for in-progress visit', async () => {
            const activeVisit = createMockVisit({ status: 'in_progress' });

            pool.query.mockResolvedValueOnce(createQueryResult([{
                id: activeVisit.id,
                status: 'in_progress'
            }]));

            const result = await MedicalRecordModel.validateVisitLinkage(activeVisit.id);

            expect(result).toBe(true);
        });

        it('should allow record creation for completed visit', async () => {
            const completedVisit = createCompletedVisit();

            pool.query.mockResolvedValueOnce(createQueryResult([{
                id: completedVisit.id,
                status: 'completed'
            }]));

            const result = await MedicalRecordModel.validateVisitLinkage(completedVisit.id);

            expect(result).toBe(true);
        });

        it('should allow record creation without visit (null visitId)', async () => {
            const result = await MedicalRecordModel.validateVisitLinkage(null);

            expect(result).toBe(true);
            expect(pool.query).not.toHaveBeenCalled();
        });

        it('should allow record creation without visit (undefined visitId)', async () => {
            const result = await MedicalRecordModel.validateVisitLinkage(undefined);

            expect(result).toBe(true);
        });

        it('should throw error when visit not found', async () => {
            const nonExistentVisitId = generateUserId();

            pool.query.mockResolvedValueOnce(createQueryResult([]));

            await expect(MedicalRecordModel.validateVisitLinkage(nonExistentVisitId))
                .rejects.toThrow('Visit not found');
        });
    });

    // =============================================
    // CREATE RECORD TESTS
    // =============================================
    describe('Create Medical Record', () => {
        it('should create medical record with immutable flag', async () => {
            const recordData = {
                patientId: generateUserId(),
                visitId: generateUserId(),
                type: 'lab_result',
                title: 'Blood Test Results',
                description: 'Complete blood count',
                createdBy: generateUserId(),
                immutableFlag: true
            };

            const createdRecord = {
                id: generateUserId(),
                patient_id: recordData.patientId,
                visit_id: recordData.visitId,
                type: recordData.type,
                title: recordData.title,
                description: recordData.description,
                created_by: recordData.createdBy,
                immutable_flag: true,
                created_at: new Date().toISOString()
            };

            pool.query.mockResolvedValueOnce(createQueryResult([createdRecord]));

            const result = await MedicalRecordModel.create(recordData);

            expect(result.immutable_flag).toBe(true);
            expect(pool.query).toHaveBeenCalledWith(
                expect.stringContaining('INSERT INTO medical_records'),
                expect.arrayContaining([recordData.patientId, true])
            );
        });

        it('should create medical record with default mutable flag', async () => {
            const recordData = {
                patientId: generateUserId(),
                visitId: generateUserId(),
                type: 'consultation',
                title: 'General Consultation',
                description: 'Follow-up visit',
                createdBy: generateUserId()
                // immutableFlag not provided
            };

            const createdRecord = {
                id: generateUserId(),
                ...recordData,
                immutable_flag: false
            };

            pool.query.mockResolvedValueOnce(createQueryResult([createdRecord]));

            const result = await MedicalRecordModel.create(recordData);

            expect(result.immutable_flag).toBe(false);
        });
    });

    // =============================================
    // FIND RECORD TESTS
    // =============================================
    describe('Find Medical Record', () => {
        it('should find record by ID with related data', async () => {
            const recordId = generateUserId();
            const record = createMockMedicalRecord({ id: recordId });

            pool.query.mockResolvedValueOnce(createQueryResult([{
                ...record,
                created_by_name: 'Dr. Test',
                created_by_role: 'doctor',
                unique_health_id: 'UHI123',
                visit_code: 'VIS-001',
                visit_status: 'in_progress'
            }]));

            const result = await MedicalRecordModel.findById(recordId);

            expect(result.id).toBe(recordId);
            expect(result.created_by_name).toBe('Dr. Test');
        });

        it('should return undefined when record not found', async () => {
            const nonExistentId = generateUserId();

            pool.query.mockResolvedValueOnce(createQueryResult([]));

            const result = await MedicalRecordModel.findById(nonExistentId);

            expect(result).toBeUndefined();
        });

        it('should find records by patient ID', async () => {
            const patientId = generateUserId();
            const records = [
                createMockMedicalRecord({ patient_id: patientId }),
                createMockMedicalRecord({ patient_id: patientId })
            ];

            pool.query.mockResolvedValueOnce(createQueryResult(records));

            const result = await MedicalRecordModel.findByPatientId(patientId);

            expect(result).toHaveLength(2);
        });

        it('should find records by visit ID', async () => {
            const visitId = generateUserId();
            const records = [
                createMockMedicalRecord({ visit_id: visitId })
            ];

            pool.query.mockResolvedValueOnce(createQueryResult(records));

            const result = await MedicalRecordModel.findByVisitId(visitId);

            expect(result).toHaveLength(1);
        });
    });

    // =============================================
    // COUNT RECORDS TESTS
    // =============================================
    describe('Count Records', () => {
        it('should count all records for patient', async () => {
            const patientId = generateUserId();

            pool.query.mockResolvedValueOnce(createQueryResult([{ count: '5' }]));

            const result = await MedicalRecordModel.countByPatient(patientId);

            expect(result).toBe(5);
        });

        it('should count records by type for patient', async () => {
            const patientId = generateUserId();

            pool.query.mockResolvedValueOnce(createQueryResult([{ count: '2' }]));

            const result = await MedicalRecordModel.countByPatient(patientId, 'lab_result');

            expect(result).toBe(2);
            expect(pool.query).toHaveBeenCalledWith(
                expect.stringContaining('type = $2'),
                [patientId, 'lab_result']
            );
        });
    });
});
