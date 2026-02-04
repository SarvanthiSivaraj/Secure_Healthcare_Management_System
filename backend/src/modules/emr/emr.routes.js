const express = require('express');
const router = express.Router();
const EmrController = require('./emr.controller');
const { authenticate } = require('../../middleware/auth.middleware');
const { uploadSingle, handleUploadError } = require('../../middleware/file.upload.middleware');

// ==================== Medical Records ====================

/**
 * @route   POST /api/emr/medical-records
 * @desc    Create a new medical record
 * @access  Private (Doctor, Nurse)
 */
router.post('/medical-records', authenticate, EmrController.createMedicalRecord);

/**
 * @route   GET /api/emr/medical-records/:recordId
 * @desc    Get medical record by ID
 * @access  Private
 */
router.get('/medical-records/:recordId', authenticate, EmrController.getMedicalRecord);

/**
 * @route   GET /api/emr/patients/:patientId/medical-records
 * @desc    Get all medical records for a patient
 * @access  Private
 */
router.get('/patients/:patientId/medical-records', authenticate, EmrController.getPatientMedicalRecords);

// ==================== Diagnoses ====================

/**
 * @route   POST /api/emr/diagnoses
 * @desc    Create a new diagnosis
 * @access  Private (Doctor)
 */
router.post('/diagnoses', authenticate, EmrController.createDiagnosis);

/**
 * @route   POST /api/emr/diagnoses/:diagnosisId/addendum
 * @desc    Create diagnosis addendum (new version)
 * @access  Private (Doctor)
 */
router.post('/diagnoses/:diagnosisId/addendum', authenticate, EmrController.createDiagnosisAddendum);

/**
 * @route   PATCH /api/emr/diagnoses/:diagnosisId/status
 * @desc    Update diagnosis status
 * @access  Private (Doctor)
 */
router.patch('/diagnoses/:diagnosisId/status', authenticate, EmrController.updateDiagnosisStatus);

// ==================== Prescriptions ====================

/**
 * @route   POST /api/emr/prescriptions
 * @desc    Create a new prescription with validation
 * @access  Private (Doctor)
 */
router.post('/prescriptions', authenticate, EmrController.createPrescription);

/**
 * @route   POST /api/emr/prescriptions/check-interactions
 * @desc    Check drug interactions for a medication
 * @access  Private (Doctor)
 */
router.post('/prescriptions/check-interactions', authenticate, EmrController.checkDrugInteractions);

/**
 * @route   PATCH /api/emr/prescriptions/:prescriptionId/status
 * @desc    Update prescription status
 * @access  Private (Doctor, Pharmacist)
 */
router.patch('/prescriptions/:prescriptionId/status', authenticate, EmrController.updatePrescriptionStatus);

// ==================== Lab Results ====================

/**
 * @route   POST /api/emr/lab-results
 * @desc    Upload lab result with file
 * @access  Private (Lab Technician, Doctor)
 */
router.post(
    '/lab-results',
    authenticate,
    uploadSingle,
    handleUploadError,
    EmrController.uploadLabResult
);

// ==================== Imaging Reports ====================

/**
 * @route   POST /api/emr/imaging-reports
 * @desc    Upload imaging report with file (including DICOM)
 * @access  Private (Radiologist, Doctor)
 */
router.post(
    '/imaging-reports',
    authenticate,
    uploadSingle,
    handleUploadError,
    EmrController.uploadImagingReport
);

module.exports = router;
