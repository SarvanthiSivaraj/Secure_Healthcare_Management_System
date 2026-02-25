const express = require('express');
const router = express.Router();
const NurseController = require('./nurse.controller');
const { authenticate } = require('../../middleware/auth.middleware');
const { requireRole } = require('../../middleware/rbac.middleware');

/**
 * Nurse Routes
 * Base path: /api/nurse
 */

router.get(
    '/stats',
    authenticate,
    requireRole(['nurse', 'system_admin']),
    NurseController.getDashboardStats
);

module.exports = router;
