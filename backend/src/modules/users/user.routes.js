const express = require('express');
const router = express.Router();
const userCompat = require('./user.compat');
const { authenticate } = require('../../middleware/auth.middleware');
const { requireAdmin, requireSystemAdmin } = require('../../middleware/rbac.middleware');
const { auditLog } = require('../../middleware/audit.middleware');
const { asyncHandler } = require('../../middleware/error.middleware');

/**
 * @route   GET /api/users/profile
 * @desc    Get current user profile
 * @access  Private
 */
router.get(
    '/profile',
    authenticate,
    asyncHandler(userCompat.getUserProfile)
);

/**
 * @route   GET /api/users/doctors
 * @desc    Get all active doctors (for consent management)
 * @access  Private
 */
router.get(
    '/doctors',
    authenticate,
    asyncHandler(userCompat.getDoctors)
);

/**
 * @route   POST /api/users/staff/onboard
 * @desc    Onboard new staff member
 * @access  Private (Admin only)
 */
router.post(
    '/staff/onboard',
    authenticate,
    requireAdmin,
    auditLog('staff_onboard', 'user'),
    asyncHandler(userCompat.onboardStaff)
);

/**
 * @route   PUT /api/users/staff/deactivate
 * @desc    Deactivate staff member
 * @access  Private (Admin only)
 */
router.put(
    '/staff/deactivate',
    authenticate,
    requireAdmin,
    auditLog('staff_deactivate', 'user'),
    asyncHandler(userCompat.deactivateStaff)
);

/**
 * @route   PUT /api/users/staff/verify-license
 * @desc    Verify staff professional license
 * @access  Private (Admin only)
 */
router.put(
    '/staff/verify-license',
    authenticate,
    requireAdmin,
    auditLog('license_verify', 'staff_mapping'),
    asyncHandler(userCompat.verifyLicense)
);

/**
 * @route   GET /api/users
 * @desc    Get all users
 * @access  Private (System Admin only)
 */
router.get(
    '/',
    authenticate,
    requireSystemAdmin,
    asyncHandler(userCompat.getUsers)
);

module.exports = router;
