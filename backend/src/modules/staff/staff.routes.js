const express = require('express');
const router = express.Router();
const StaffController = require('./staff.controller');
const { authenticate } = require('../../middleware/auth.middleware');
const { requireRole } = require('../../middleware/rbac.middleware');

/**
 * Staff Management Routes
 * Base path: /api/staff
 */

// ============================================================================
// Invitation Management (Admin only)
// ============================================================================

router.post(
    '/invite',
    authenticate,
    requireRole(['admin']),
    StaffController.inviteStaff
);

router.get(
    '/invitations',
    authenticate,
    requireRole(['admin']),
    StaffController.getInvitations
);

router.post(
    '/invitations/:id/resend',
    authenticate,
    requireRole(['admin']),
    StaffController.resendInvitation
);

router.delete(
    '/invitations/:id',
    authenticate,
    requireRole(['admin']),
    StaffController.cancelInvitation
);

router.get(
    '/invitations/stats',
    authenticate,
    requireRole(['admin']),
    StaffController.getInvitationStats
);

// ============================================================================
// Public Invitation Endpoints (No authentication required)
// ============================================================================

router.get(
    '/invitations/:token/validate',
    StaffController.validateInvitation
);

router.post(
    '/invitations/:token/accept',
    StaffController.acceptInvitation
);

// ============================================================================
// Account Management (Admin only)
// ============================================================================

router.post(
    '/accounts/:userId/suspend',
    authenticate,
    requireRole(['admin']),
    StaffController.suspendAccount
);

router.post(
    '/accounts/:userId/activate',
    authenticate,
    requireRole(['admin']),
    StaffController.activateAccount
);

router.get(
    '/accounts/suspended',
    authenticate,
    requireRole(['admin']),
    StaffController.getSuspendedAccounts
);

router.get(
    '/accounts/:userId/status',
    authenticate,
    requireRole(['admin']),
    StaffController.getAccountStatus
);

router.get(
    '/accounts/stats',
    authenticate,
    requireRole(['admin']),
    StaffController.getAccountStats
);

router.get(
    '/accounts/:userId/history',
    authenticate,
    requireRole(['admin']),
    StaffController.getAccountHistory
);

// ============================================================================
// Audit Trail (Admin only)
// ============================================================================

router.get(
    '/actions/recent',
    authenticate,
    requireRole(['admin']),
    StaffController.getRecentActions
);

module.exports = router;
