/**
 * Epic 3: EMR - Controller Tests
 * Tests for file upload malware scanning and EMR operations
 */

const {
    createMockRequest,
    createMockResponse,
    createMockNext,
    createMockDoctor,
    createMockMedicalRecord
} = require('../../utils/testData.factory');
const { generateUserId } = require('../../mocks/jwt.mock');
const { createQueryResult } = require('../../mocks/db.mock');

// Mock dependencies
jest.mock('../../../src/config/db');
jest.mock('../../../src/models/medical_record.model');
jest.mock('../../../src/models/consent.model');
jest.mock('../../../src/models/lab_result.model');
jest.mock('../../../src/services/file.upload.service');
jest.mock('../../../src/services/prescription.validator.service');
jest.mock('../../../src/services/audit.service');
jest.mock('../../../src/services/dicom.service');

const pool = require('../../../src/config/db');
const MedicalRecordModel = require('../../../src/models/medical_record.model');
const { checkConsent } = require('../../../src/models/consent.model');
const LabResultModel = require('../../../src/models/lab_result.model');
const FileUploadService = require('../../../src/services/file.upload.service');
const { createAuditLog } = require('../../../src/services/audit.service');
const { isDicomFile } = require('../../../src/services/dicom.service');

// Import controller functions
const {
    createMedicalRecord,
    getMedicalRecord,
    uploadLabResult,
    uploadImagingReport
} = require('../../../src/modules/emr/emr.controller');

describe('Epic 3: EMR Controller', () => {
    let mockReq, mockRes, mockNext;

    beforeEach(() => {
        jest.clearAllMocks();
        mockReq = createMockRequest();
        mockRes = createMockResponse();
        mockNext = createMockNext();

        createAuditLog.mockResolvedValue({});

        // Mock isDicomFile to return false by default (non-DICOM files)
        isDicomFile.mockReturnValue(false);

        // Mock checkConsent to return true by default (allow operations)
        checkConsent.mockResolvedValue(true);
    });

    // =============================================
    // FILE UPLOAD MALWARE TEST
    // =============================================
    describe('File Upload Malware Detection', () => {
        it('should reject file when malware is detected', async () => {
            const doctor = createMockDoctor();
            const recordId = generateUserId();

            mockReq.user = doctor;
            mockReq.params = { recordId };
            mockReq.file = {
                buffer: Buffer.from('EICAR-TEST-FILE'),
                originalname: 'infected.pdf',
                mimetype: 'application/pdf',
                size: 1024
            };
            mockReq.body = {
                testName: 'Blood Test',
                testType: 'hematology'
            };

            // Mock record lookup
            MedicalRecordModel.findById.mockResolvedValue(
                createMockMedicalRecord({ id: recordId })
            );

            // Mock malware detection
            FileUploadService.processUpload.mockRejectedValue(
                new Error('Malware detected in uploaded file')
            );

            await uploadLabResult(mockReq, mockRes);

            expect(mockRes.status).toHaveBeenCalledWith(500);
            expect(mockRes.json).toHaveBeenCalledWith(
                expect.objectContaining({
                    success: false,
                    message: expect.stringContaining('Malware')
                })
            );
        });

        it('should accept clean file upload', async () => {
            const doctor = createMockDoctor();
            const recordId = generateUserId();
            const labResultId = generateUserId();

            mockReq.user = doctor;
            mockReq.params = { recordId };
            mockReq.file = {
                buffer: Buffer.from('clean file content'),
                originalname: 'results.pdf',
                mimetype: 'application/pdf',
                size: 2048
            };
            mockReq.body = {
                testName: 'Blood Test',
                testType: 'hematology',
                resultValue: '120',
                unit: 'mg/dL'
            };

            // Mock record lookup
            MedicalRecordModel.findById.mockResolvedValue(
                createMockMedicalRecord({ id: recordId })
            );

            // Mock successful file processing
            FileUploadService.processUpload.mockResolvedValue({
                filename: 'results_processed.pdf',
                path: '/uploads/lab/results_processed.pdf',
                mimetype: 'application/pdf',
                size: 2048
            });

            // Mock lab result creation
            pool.query.mockResolvedValue(createQueryResult([{
                id: labResultId,
                record_id: recordId,
                test_name: 'Blood Test',
                file_path: '/uploads/lab/results_processed.pdf'
            }]));

            await uploadLabResult(mockReq, mockRes);

            expect(FileUploadService.processUpload).toHaveBeenCalledWith(
                mockReq.file,
                expect.objectContaining({
                    scanForMalware: true
                })
            );
            expect(mockRes.status).toHaveBeenCalledWith(201);
        });

        it('should verify FileUploadService receives scanForMalware option', async () => {
            const doctor = createMockDoctor();
            const recordId = generateUserId();

            mockReq.user = doctor;
            mockReq.params = { recordId };
            mockReq.file = {
                buffer: Buffer.from('test content'),
                originalname: 'scan.pdf',
                mimetype: 'application/pdf',
                size: 512
            };
            mockReq.body = { testName: 'Test', testType: 'test' };

            MedicalRecordModel.findById.mockResolvedValue(
                createMockMedicalRecord({ id: recordId })
            );
            FileUploadService.processUpload.mockResolvedValue({
                filename: 'scan.pdf',
                path: '/uploads/scan.pdf'
            });
            pool.query.mockResolvedValue(createQueryResult([{ id: generateUserId() }]));

            await uploadLabResult(mockReq, mockRes);

            // Verify malware scanning was requested
            expect(FileUploadService.processUpload).toHaveBeenCalledWith(
                expect.any(Object),
                expect.objectContaining({
                    scanForMalware: true
                })
            );
        });

        it('should reject upload when no file is provided', async () => {
            const doctor = createMockDoctor();
            const recordId = generateUserId();

            mockReq.user = doctor;
            mockReq.params = { recordId };
            mockReq.file = null; // No file
            mockReq.body = { testName: 'Test', testType: 'test' };

            MedicalRecordModel.findById.mockResolvedValue(
                createMockMedicalRecord({ id: recordId })
            );

            await uploadLabResult(mockReq, mockRes);

            expect(mockRes.status).toHaveBeenCalledWith(400);
            expect(mockRes.json).toHaveBeenCalledWith(
                expect.objectContaining({
                    message: expect.stringContaining('file')
                })
            );
        });

        it('should return 404 when record not found', async () => {
            const doctor = createMockDoctor();
            const recordId = generateUserId();

            mockReq.user = doctor;
            mockReq.params = { recordId };
            mockReq.file = {
                buffer: Buffer.from('content'),
                originalname: 'test.pdf'
            };

            MedicalRecordModel.findById.mockResolvedValue(null);

            await uploadLabResult(mockReq, mockRes);

            expect(mockRes.status).toHaveBeenCalledWith(404);
        });
    });

    // =============================================
    // IMAGING REPORT UPLOAD TESTS
    // =============================================
    describe('Imaging Report Upload', () => {
        it('should scan imaging files for malware', async () => {
            const doctor = createMockDoctor();
            const recordId = generateUserId();

            mockReq.user = doctor;
            mockReq.params = { recordId };
            mockReq.file = {
                buffer: Buffer.from('DICOM content'),
                originalname: 'xray.dcm',
                mimetype: 'application/dicom',
                size: 50000
            };
            mockReq.body = {
                imagingType: 'xray',
                bodyPart: 'chest',
                modality: 'CR'
            };

            MedicalRecordModel.findById.mockResolvedValue(
                createMockMedicalRecord({ id: recordId })
            );
            FileUploadService.processUpload.mockResolvedValue({
                filename: 'xray.dcm',
                path: '/uploads/imaging/xray.dcm'
            });
            pool.query.mockResolvedValue(createQueryResult([{ id: generateUserId() }]));

            await uploadImagingReport(mockReq, mockRes);

            expect(FileUploadService.processUpload).toHaveBeenCalledWith(
                expect.any(Object),
                expect.objectContaining({
                    scanForMalware: true
                })
            );
        });

        it('should reject infected imaging file', async () => {
            const doctor = createMockDoctor();
            const recordId = generateUserId();

            mockReq.user = doctor;
            mockReq.params = { recordId };
            mockReq.file = {
                buffer: Buffer.from('malicious content'),
                originalname: 'infected.dcm'
            };
            mockReq.body = { imagingType: 'ct', bodyPart: 'head' };

            MedicalRecordModel.findById.mockResolvedValue(
                createMockMedicalRecord({ id: recordId })
            );
            FileUploadService.processUpload.mockRejectedValue(
                new Error('Malware detected in uploaded file')
            );

            await uploadImagingReport(mockReq, mockRes);

            expect(mockRes.status).toHaveBeenCalledWith(500);
        });
    });

    // =============================================
    // MEDICAL RECORD CRUD TESTS
    // =============================================
    describe('Medical Record CRUD', () => {
        it('should create medical record with immutable flag', async () => {
            const doctor = createMockDoctor();
            const patientId = generateUserId();
            const visitId = generateUserId();

            mockReq.user = doctor;
            mockReq.body = {
                patientId,
                visitId,
                type: 'lab_result',
                title: 'Blood Work',
                description: 'Complete blood count',
                immutableFlag: true
            };

            MedicalRecordModel.validateVisitLinkage.mockResolvedValue(true);
            MedicalRecordModel.create.mockResolvedValue({
                id: generateUserId(),
                patient_id: patientId,
                immutable_flag: true
            });

            await createMedicalRecord(mockReq, mockRes);

            expect(MedicalRecordModel.create).toHaveBeenCalledWith(
                expect.objectContaining({
                    patientId,
                    immutableFlag: true
                })
            );
            expect(mockRes.status).toHaveBeenCalledWith(201);
        });

        it('should get medical record by ID', async () => {
            const recordId = generateUserId();
            const record = createMockMedicalRecord({ id: recordId });

            mockReq.params = { recordId };

            MedicalRecordModel.findById.mockResolvedValue(record);

            await getMedicalRecord(mockReq, mockRes);

            expect(mockRes.json).toHaveBeenCalledWith(
                expect.objectContaining({
                    success: true,
                    data: expect.objectContaining({
                        id: recordId
                    })
                })
            );
        });

        it('should return 404 for non-existent record', async () => {
            mockReq.params = { recordId: generateUserId() };

            MedicalRecordModel.findById.mockResolvedValue(null);

            await getMedicalRecord(mockReq, mockRes);

            expect(mockRes.status).toHaveBeenCalledWith(404);
        });
    });

    // AUDIT LOGGING FOR FILE UPLOADS
    // =============================================
    // Note: Audit logging for file uploads is handled by the audit middleware
    // in the routes layer, not in the controller itself. Controller only handles
    // business logic for file processing and storage.
});
