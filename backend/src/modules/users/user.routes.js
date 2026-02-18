const express = require('express');
const router = express.Router();
const userController = require('./user.controller');
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
    asyncHandler(userController.getUserProfile)
);

/**
 * @route   GET /api/users/doctors
 * @desc    Get all active doctors (for consent management)
 * @access  Private
 */
router.get(
    '/doctors',
    authenticate,
    asyncHandler(userController.getDoctors)
);

/**
 * @route   GET /api/users/nurses
 * @desc    Get all active nurses
 * @access  Private
 */
router.get(
    '/nurses',
    authenticate,
    asyncHandler(userController.getNurses)
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
    asyncHandler(userController.onboardStaff)
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
    asyncHandler(userController.deactivateStaff)
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
    asyncHandler(userController.verifyLicense)
);

/**
 * @route   GET /api/users
 * @desc    Get all users
 * @access  Private (System Admin only)
 */
router.get(
    '/',
    authenticate,
    requireAdmin,
    asyncHandler(userController.getUsers)
);

module.exports = router;
