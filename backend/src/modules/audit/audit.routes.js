const express = require('express');
const router = express.Router();
const AuditController = require('./audit.controller');
const { authenticate, authorize } = require('../../middleware/auth.middleware');

/**
 * @route   GET /api/audit/my-trail
 * @desc    Get audit trail for the logged-in patient
 * @access  Private (Patient only)
 */
router.get(
    '/my-trail',
    authenticate,
    authorize(['patient']),
    AuditController.getPatientAuditTrail
);

module.exports = router;
