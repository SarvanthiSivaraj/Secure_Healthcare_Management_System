const express = require('express');
const router = express.Router();
const AdminController = require('./admin.controller');
const { authenticate } = require('../../middleware/auth.middleware');
const { requireRole } = require('../../middleware/rbac.middleware');
const { ROLES } = require('../../utils/constants');

/**
 * Admin Routes
 * Base path: /api/admin
 */

// Organizations Verification
router.get(
    '/organizations/pending',
    authenticate,
    requireRole(['admin', 'system_admin']),
    AdminController.getPendingOrganizations
);

router.post(
    '/organizations/:orgId/approve',
    authenticate,
    requireRole(['admin', 'system_admin']),
    AdminController.approveOrganization
);

router.post(
    '/organizations/:orgId/reject',
    authenticate,
    requireRole(['admin', 'system_admin']),
    AdminController.rejectOrganization
);

module.exports = router;
