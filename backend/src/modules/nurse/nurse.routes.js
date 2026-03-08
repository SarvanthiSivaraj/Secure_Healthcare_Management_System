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

router.get(
    '/profile',
    authenticate,
    requireRole(['nurse']),
    NurseController.getProfile
);

router.put(
    '/profile',
    authenticate,
    requireRole(['nurse']),
    NurseController.updateProfile
);

router.get(
    '/assigned-patients',
    authenticate,
    requireRole(['nurse']),
    NurseController.getAssignedPatients
);

router.get(
    '/activities',
    authenticate,
    requireRole(['nurse']),
    NurseController.getActivities
);

router.get(
    '/vitals',
    authenticate,
    requireRole(['nurse']),
    NurseController.getVitals
);

router.get(
    '/schedule',
    authenticate,
    requireRole(['nurse']),
    NurseController.getSchedule
);

module.exports = router;
