const express = require('express');
const router = express.Router();
const DoctorVerificationController = require('./doctor.verification.controller');
const { authenticate } = require('../../middleware/auth.middleware');
const { requireRole, requireAdmin } = require('../../middleware/rbac.middleware');
const { uploadSingle } = require('../../middleware/file.upload.middleware');

/**
 * Doctor Verification Routes
 * Base path: /api/doctors/verification
 */

// Doctor endpoints (authenticated doctors only)
router.post(
    '/upload-license',
    authenticate,
    requireRole(['doctor']),
    uploadSingle,
    DoctorVerificationController.uploadLicense
);

router.post(
    '/submit',
    authenticate,
    requireRole(['doctor']),
    DoctorVerificationController.submitForVerification
);

router.get(
    '/status',
    authenticate,
    requireRole(['doctor']),
    DoctorVerificationController.getStatus
);

router.get(
    '/documents',
    authenticate,
    requireRole(['doctor']),
    DoctorVerificationController.getDocuments
);

// Admin endpoints (admin only)
router.get(
    '/pending',
    authenticate,
    requireAdmin,
    DoctorVerificationController.getPending
);

router.post(
    '/:userId/approve',
    authenticate,
    requireAdmin,
    DoctorVerificationController.approve
);

router.post(
    '/:userId/reject',
    authenticate,
    requireAdmin,
    DoctorVerificationController.reject
);

router.get(
    '/stats',
    authenticate,
    requireAdmin,
    DoctorVerificationController.getStats
);

module.exports = router;
