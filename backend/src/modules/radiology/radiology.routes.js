const express = require('express');
const router = express.Router();
const radiologyController = require('./radiology.controller');
const { authenticate } = require('../../middleware/auth.middleware');
const { auditLog } = require('../../middleware/audit.middleware');
const { uploadSingle } = require('../../middleware/file.upload.middleware');

// All radiology routes require authentication
router.use(authenticate);

/**
 * Dashboard statistics
 */
router.get('/stats', radiologyController.getStats);

/**
 * Imaging Queue
 */
router.get('/orders', radiologyController.getOrders);

/**
 * Report Upload
 */
router.post(
    '/upload',
    uploadSingle,
    auditLog('upload_radiology_report', 'radiology_report'),
    radiologyController.uploadReport
);

/**
 * Profile Management
 */
router.get('/profile', radiologyController.getProfile);
router.put('/profile', auditLog('update_radiology_profile', 'user'), radiologyController.updateProfile);

/**
 * Audit Logs
 */
router.get('/audit-logs', radiologyController.getAuditLogs);

module.exports = router;
