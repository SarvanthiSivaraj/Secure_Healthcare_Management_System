const express = require('express');
const router = express.Router();
const auditController = require('./audit.controller');
const { authenticate, authorize } = require('../../middleware/auth.middleware');

/**
 * @route   GET /api/audit/logs
 * @desc    Get all audit logs
 * @access  Private (Admin)
 */
router.get(
    '/logs',
    authenticate,
    authorize('ADMIN', 'SYSTEM_ADMIN'),
    auditController.getAllAuditLogs
);

/**
 * @route   GET /api/audit/users/:userId/logs
 * @desc    Get audit logs for a specific user
 * @access  Private (Admin)
 */
router.get(
    '/users/:userId/logs',
    authenticate,
    authorize('ADMIN', 'SYSTEM_ADMIN'),
    auditController.getUserAuditLogs
);

module.exports = router;
