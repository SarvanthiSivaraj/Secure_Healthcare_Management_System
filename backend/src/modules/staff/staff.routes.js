const express = require('express');
const router = express.Router();
const StaffController = require('./staff.controller');
const { authenticate } = require('../../middleware/auth.middleware');
const { requireAdmin } = require('../../middleware/rbac.middleware');

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
    requireAdmin,
    StaffController.inviteStaff
);

router.get(
    '/invitations',
    authenticate,
    requireAdmin,
    StaffController.getInvitations
);

router.post(
    '/invitations/:id/resend',
    authenticate,
    requireAdmin,
    StaffController.resendInvitation
);

router.delete(
    '/invitations/:id',
    authenticate,
    requireAdmin,
    StaffController.cancelInvitation
);

router.get(
    '/invitations/stats',
    authenticate,
    requireAdmin,
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
    requireAdmin,
    StaffController.suspendAccount
);

router.post(
    '/accounts/:userId/activate',
    authenticate,
    requireAdmin,
    StaffController.activateAccount
);

router.get(
    '/accounts/suspended',
    authenticate,
    requireAdmin,
    StaffController.getSuspendedAccounts
);

router.get(
    '/accounts/:userId/status',
    authenticate,
    requireAdmin,
    StaffController.getAccountStatus
);

router.get(
    '/accounts/stats',
    authenticate,
    requireAdmin,
    StaffController.getAccountStats
);

router.get(
    '/accounts/:userId/history',
    authenticate,
    requireAdmin,
    StaffController.getAccountHistory
);

// ============================================================================
// Audit Trail (Admin only)
// ============================================================================

router.get(
    '/actions/recent',
    authenticate,
    requireAdmin,
    StaffController.getRecentActions
);

module.exports = router;
