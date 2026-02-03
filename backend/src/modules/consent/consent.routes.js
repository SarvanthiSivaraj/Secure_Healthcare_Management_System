const express = require('express');
const router = express.Router();
const consentController = require('./consent.controller');
const { authenticate } = require('../../middleware/auth.middleware');
const { requireRole } = require('../../middleware/rbac.middleware');
const { auditLog } = require('../../middleware/audit.middleware');
const { asyncHandler } = require('../../middleware/error.middleware');

/**
 * @route   GET /api/consent/active
 * @desc    Get all active consents for current patient
 * @access  Private (Patient only)
 */
router.get(
    '/active',
    authenticate,
    requireRole('patient'),
    asyncHandler(consentController.getActiveConsents)
);

/**
 * @route   GET /api/consent/history
 * @desc    Get consent history for current patient
 * @access  Private (Patient only)
 */
router.get(
    '/history',
    authenticate,
    requireRole('patient'),
    asyncHandler(consentController.getConsentHistory)
);

/**
 * @route   POST /api/consent/grant
 * @desc    Grant new consent
 * @access  Private (Patient only)
 */
router.post(
    '/grant',
    authenticate,
    requireRole('patient'),
    auditLog('consent_grant', 'consent'),
    asyncHandler(consentController.grantConsent)
);

/**
 * @route   PUT /api/consent/revoke/:consentId
 * @desc    Revoke existing consent
 * @access  Private (Patient only)
 */
router.put(
    '/revoke/:consentId',
    authenticate,
    requireRole('patient'),
    auditLog('consent_revoke', 'consent'),
    asyncHandler(consentController.revokeConsent)
);

module.exports = router;
