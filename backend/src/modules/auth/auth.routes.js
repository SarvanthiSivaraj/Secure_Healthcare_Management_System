const express = require('express');
const router = express.Router();
const authCompat = require('./auth.compat');
const { authenticate } = require('../../middleware/auth.middleware');
const { auditActions } = require('../../middleware/audit.middleware');
const { loginLimiter, otpLimiter, registrationLimiter } = require('../../middleware/rateLimit.middleware');
const { asyncHandler } = require('../../middleware/error.middleware');

/**
 * @route   POST /api/auth/register/patient
 * @desc    Register a new patient
 * @access  Public
 */
router.post(
    '/register/patient',
    registrationLimiter,
    asyncHandler(authCompat.registerPatient)
);

/**
 * @route   POST /api/auth/register/doctor
 * @desc    Register a new doctor
 * @access  Public
 */
router.post(
    '/register/doctor',
    registrationLimiter,
    asyncHandler(authCompat.registerDoctor)
);

/**
 * @route   POST /api/auth/register/organization
 * @desc    Register a new organization (hospital/clinic/pharmacy)
 * @access  Public
 */
router.post(
    '/register/organization',
    registrationLimiter,
    asyncHandler(authCompat.registerOrganization)
);

/**
 * @route   POST /api/auth/verify-otp
 * @desc    Verify OTP code
 * @access  Public
 */
router.post(
    '/verify-otp',
    otpLimiter,
    asyncHandler(authCompat.verifyOTPController)
);

/**
 * @route   POST /api/auth/otp/verify
 * @desc    Verify OTP code (frontend compatibility endpoint)
 * @access  Public
 */
router.post(
    '/otp/verify',
    otpLimiter,
    asyncHandler(authCompat.verifyOTPController)
);

/**
 * @route   POST /api/auth/resend-otp
 * @desc    Resend OTP code
 * @access  Public
 */
router.post(
    '/resend-otp',
    otpLimiter,
    asyncHandler(authCompat.resendOTP)
);

/**
 * @route   POST /api/auth/login
 * @desc    Login user (with frontend compatibility)
 * @access  Public
 */
router.post(
    '/login',
    loginLimiter,
    auditActions.login,
    asyncHandler(authCompat.loginCompat)
);

/**
 * @route   GET /api/auth/verify
 * @desc    Verify JWT token and return user info
 * @access  Private
 */
router.get(
    '/verify',
    authenticate,
    asyncHandler(async (req, res) => {
        res.json({
            success: true,
            message: 'Token is valid',
            user: {
                id: req.user.id,
                email: req.user.email,
                firstName: req.user.firstName,
                lastName: req.user.lastName,
                role: req.user.role
            }
        });
    })
);

/**
 * @route   POST /api/auth/logout
 * @desc    Logout user
 * @access  Private
 */
router.post(
    '/logout',
    authenticate,
    auditActions.logout,
    asyncHandler(authCompat.logout)
);

module.exports = router;
