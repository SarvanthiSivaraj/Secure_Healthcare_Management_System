const MedicalRecordModel = require('../../models/medical_record.model');
const DiagnosisModel = require('../../models/diagnosis.model');
const PrescriptionModel = require('../../models/prescription.model');
const LabResultModel = require('../../models/lab_result.model');
const ImagingReportModel = require('../../models/imaging_report.model');
const FileUploadService = require('../../services/file.upload.service');
const DicomService = require('../../services/dicom.service');
const PrescriptionValidatorService = require('../../services/prescription.validator.service');
const DrugInteractionService = require('../../services/drug.interaction.service');
const { checkConsent } = require('../../models/consent.model');

class EmrController {
    // ==================== Medical Records ====================

    /**
     * Create medical record
     * Requires WRITE consent to create new records
     */
    static async createMedicalRecord(req, res) {
        try {
            const { patientId, visitId, type, title, description } = req.body;
            const createdBy = req.user.id;

            // Check if doctor has WRITE consent for this patient
            // Creating new records requires write permission
            const hasWriteConsent = await checkConsent(
                patientId,
                createdBy,
                'all', // Use 'all' to match consent data_category
                'write' // WRITE consent required to create records
            );

            if (!hasWriteConsent) {
                return res.status(403).json({
                    success: false,
                    message: 'Write access required to create medical records'
                });
            }

            // Validate visit linkage
            if (visitId) {
                await MedicalRecordModel.validateVisitLinkage(visitId);
            }

            // Always create records as immutable (no editing allowed)
            const record = await MedicalRecordModel.create({
                patientId,
                visitId,
                type,
                title,
                description,
                createdBy,
                immutableFlag: true  // All medical records are immutable
            });

            res.status(201).json({
                success: true,
                message: 'Medical record created successfully',
                data: record
            });
        } catch (error) {
            console.error('Create medical record error:', error);
            res.status(500).json({
                success: false,
                message: error.message || 'Failed to create medical record'
            });
        }
    }

    /**
     * Get medical record by ID
     */
    static async getMedicalRecord(req, res) {
        try {
            const { recordId } = req.params;
            const { includeRelated } = req.query;

            let record;
            if (includeRelated === 'true') {
                record = await MedicalRecordModel.findByIdWithRelated(recordId);
            } else {
                record = await MedicalRecordModel.findById(recordId);
            }

            if (!record) {
                return res.status(404).json({
                    success: false,
                    message: 'Medical record not found'
                });
            }

            res.json({
                success: true,
                data: record
            });
        } catch (error) {
            console.error('Get medical record error:', error);
            res.status(500).json({
                success: false,
                message: 'Failed to retrieve medical record'
            });
        }
    }

    /**
     * Get medical records for patient
     * Requires active consent for doctors/staff, patients can view their own
     */
    static async getPatientMedicalRecords(req, res) {
        try {
            const { patientId } = req.params;
            const { type, limit, offset } = req.query;
            const userId = req.user.id;
            const userRole = req.user.role;

            // Patients can only view their own records
            if (userRole === 'PATIENT' && patientId !== userId) {
                return res.status(403).json({
                    success: false,
                    message: 'You can only view your own medical records'
                });
            }

            // Doctors/staff need active consent to view patient records
            if (userRole === 'DOCTOR' || userRole === 'NURSE' || userRole === 'STAFF') {
                const hasConsent = await checkConsent(
                    patientId,
                    userId,
                    'all', // Use 'all' to match consent data_category
                    'read'
                );

                if (!hasConsent) {
                    return res.status(403).json({
                        success: false,
                        message: 'No active consent to view this patient\'s records. Please request consent from the patient.'
                    });
                }
            }

            const records = await MedicalRecordModel.findByPatientId(patientId, {
                type,
                limit: parseInt(limit) || 50,
                offset: parseInt(offset) || 0
            });

            const count = await MedicalRecordModel.countByPatient(patientId, type);

            res.json({
                success: true,
                data: {
                    records,
                    pagination: {
                        total: count,
                        limit: parseInt(limit) || 50,
                        offset: parseInt(offset) || 0
                    }
                }
            });
        } catch (error) {
            console.error('Get patient medical records error:', error);
            res.status(500).json({
                success: false,
                message: 'Failed to retrieve medical records'
            });
        }
    }

    // ==================== Diagnoses ====================

    /**
     * Create diagnosis
     */
    static async createDiagnosis(req, res) {
        try {
            const { recordId, icdCode, description, severity, status, isPrimary, notes } = req.body;
            const diagnosedBy = req.user.id;

            // Validate ICD code
            if (!DiagnosisModel.validateIcdCode(icdCode)) {
                return res.status(400).json({
                    success: false,
                    message: 'Invalid ICD code format'
                });
            }

            const diagnosis = await DiagnosisModel.create({
                recordId,
                icdCode,
                description,
                severity,
                status,
                isPrimary,
                notes,
                diagnosedBy
            });

            res.status(201).json({
                success: true,
                message: 'Diagnosis created successfully',
                data: diagnosis
            });
        } catch (error) {
            console.error('Create diagnosis error:', error);
            res.status(500).json({
                success: false,
                message: error.message || 'Failed to create diagnosis'
            });
        }
    }

    /**
     * Create diagnosis addendum
     */
    static async createDiagnosisAddendum(req, res) {
        try {
            const { diagnosisId } = req.params;
            const addendumData = {
                ...req.body,
                diagnosedBy: req.user.id
            };

            const newVersion = await DiagnosisModel.createAddendum(diagnosisId, addendumData);

            res.status(201).json({
                success: true,
                message: 'Diagnosis addendum created successfully',
                data: newVersion
            });
        } catch (error) {
            console.error('Create diagnosis addendum error:', error);
            res.status(500).json({
                success: false,
                message: error.message || 'Failed to create diagnosis addendum'
            });
        }
    }

    /**
     * Update diagnosis status
     */
    static async updateDiagnosisStatus(req, res) {
        try {
            const { diagnosisId } = req.params;
            const { status } = req.body;

            const diagnosis = await DiagnosisModel.updateStatus(diagnosisId, status);

            res.json({
                success: true,
                message: 'Diagnosis status updated successfully',
                data: diagnosis
            });
        } catch (error) {
            console.error('Update diagnosis status error:', error);
            res.status(500).json({
                success: false,
                message: error.message || 'Failed to update diagnosis status'
            });
        }
    }

    // ==================== Prescriptions ====================

    /**
     * Create prescription with validation
     */
    static async createPrescription(req, res) {
        try {
            const prescriptionData = {
                ...req.body,
                prescribedBy: req.user.id
            };

            // Get patient ID from record
            const record = await MedicalRecordModel.findById(prescriptionData.recordId);
            if (!record) {
                return res.status(404).json({
                    success: false,
                    message: 'Medical record not found'
                });
            }

            // Validate prescription
            const validation = await PrescriptionValidatorService.validatePrescription(
                prescriptionData,
                record.patient_id,
                req.body.patientAllergies || []
            );

            if (!validation.valid) {
                return res.status(400).json({
                    success: false,
                    message: 'Prescription validation failed',
                    errors: validation.errors,
                    warnings: validation.warnings
                });
            }

            // Create prescription
            const prescription = await PrescriptionModel.create(prescriptionData);

            res.status(201).json({
                success: true,
                message: 'Prescription created successfully',
                data: prescription,
                validation: {
                    warnings: validation.warnings,
                    safetyCheck: validation.safetyCheck
                }
            });
        } catch (error) {
            console.error('Create prescription error:', error);
            res.status(500).json({
                success: false,
                message: error.message || 'Failed to create prescription'
            });
        }
    }

    /**
     * Check drug interactions
     */
    static async checkDrugInteractions(req, res) {
        try {
            const { patientId, medication } = req.body;

            const result = await DrugInteractionService.checkPatientDrugInteractions(
                patientId,
                medication
            );

            res.json({
                success: true,
                data: result
            });
        } catch (error) {
            console.error('Check drug interactions error:', error);
            res.status(500).json({
                success: false,
                message: 'Failed to check drug interactions'
            });
        }
    }

    /**
     * Update prescription status
     */
    static async updatePrescriptionStatus(req, res) {
        try {
            const { prescriptionId } = req.params;
            const { status } = req.body;

            // Validate status transition
            const validation = await PrescriptionValidatorService.validateStatusUpdate(
                prescriptionId,
                status
            );

            if (!validation.valid) {
                return res.status(400).json({
                    success: false,
                    message: validation.message,
                    allowedStatuses: validation.allowedStatuses
                });
            }

            const prescription = await PrescriptionModel.updateStatus(
                prescriptionId,
                status,
                req.user.id
            );

            res.json({
                success: true,
                message: 'Prescription status updated successfully',
                data: prescription
            });
        } catch (error) {
            console.error('Update prescription status error:', error);
            res.status(500).json({
                success: false,
                message: error.message || 'Failed to update prescription status'
            });
        }
    }

    // ==================== Lab Results ====================

    /**
     * Upload lab result
     */
    static async uploadLabResult(req, res) {
        try {
            if (!req.file) {
                return res.status(400).json({
                    success: false,
                    message: 'No file uploaded'
                });
            }

            const {
                recordId,
                testName,
                testCode,
                testCategory,
                resultsData,
                interpretation,
                referenceRange,
                abnormalFlag,
                performedBy,
                resultDate
            } = req.body;

            // Get patient ID from record
            const record = await MedicalRecordModel.findById(recordId);
            if (!record) {
                return res.status(404).json({
                    success: false,
                    message: 'Medical record not found'
                });
            }

            // Process file upload
            const fileInfo = await FileUploadService.processUpload(req.file, {
                patientId: record.patient_id,
                recordId,
                fileType: 'lab_results',
                scanForMalware: true
            });

            // Create lab result record
            const labResult = await LabResultModel.create({
                recordId,
                testName,
                testCode,
                testCategory,
                fileUrl: fileInfo.fileUrl,
                fileName: fileInfo.fileName,
                fileType: fileInfo.fileType,
                fileSize: fileInfo.fileSize,
                resultsData: resultsData ? JSON.parse(resultsData) : null,
                interpretation,
                referenceRange,
                abnormalFlag: abnormalFlag === 'true',
                orderedBy: req.user.id,
                performedBy,
                resultDate
            });

            res.status(201).json({
                success: true,
                message: 'Lab result uploaded successfully',
                data: labResult
            });
        } catch (error) {
            console.error('Upload lab result error:', error);
            res.status(500).json({
                success: false,
                message: error.message || 'Failed to upload lab result'
            });
        }
    }

    // ==================== Imaging Reports ====================

    /**
     * Upload imaging report
     */
    static async uploadImagingReport(req, res) {
        try {
            if (!req.file) {
                return res.status(400).json({
                    success: false,
                    message: 'No file uploaded'
                });
            }

            const {
                recordId,
                imagingType,
                bodyPart,
                findings,
                impression,
                radiologistNotes,
                performedBy,
                reportedBy,
                studyDate
            } = req.body;

            // Get patient ID from record
            const record = await MedicalRecordModel.findById(recordId);
            if (!record) {
                return res.status(404).json({
                    success: false,
                    message: 'Medical record not found'
                });
            }

            // Check if file is DICOM
            const fileBuffer = await FileUploadService.getFile(req.file.path);
            const isDicom = DicomService.isDicomFile(fileBuffer);

            let dicomMetadata = null;
            if (isDicom) {
                try {
                    dicomMetadata = DicomService.extractMetadata(fileBuffer);
                } catch (error) {
                    console.warn('DICOM metadata extraction failed:', error.message);
                }
            }

            // Process file upload
            const fileInfo = await FileUploadService.processUpload(req.file, {
                patientId: record.patient_id,
                recordId,
                fileType: 'imaging',
                scanForMalware: true
            });

            // Create imaging report record
            const imagingReport = await ImagingReportModel.create({
                recordId,
                imagingType,
                bodyPart,
                fileUrl: fileInfo.fileUrl,
                fileName: fileInfo.fileName,
                fileType: fileInfo.fileType,
                fileSize: fileInfo.fileSize,
                isDicom,
                dicomMetadata,
                findings,
                impression,
                radiologistNotes,
                orderedBy: req.user.id,
                performedBy,
                reportedBy,
                studyDate
            });

            res.status(201).json({
                success: true,
                message: 'Imaging report uploaded successfully',
                data: imagingReport,
                isDicom
            });
        } catch (error) {
            console.error('Upload imaging report error:', error);
            res.status(500).json({
                success: false,
                message: error.message || 'Failed to upload imaging report'
            });
        }
    }
}

module.exports = EmrController;
