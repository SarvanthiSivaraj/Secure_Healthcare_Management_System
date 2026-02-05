const { verifyAccessToken } = require('../config/jwt');
const { findUserById } = require('../models/user.model');
const { createAuditLog } = require('../services/audit.service');
const { captureDeviceInfo, validateDevice, flagSuspiciousDevice } = require('../services/device.service');
const { detectSuspiciousPatterns } = require('../services/violation.service');
const { HTTP_STATUS, ERROR_MESSAGES, AUDIT_ACTIONS, SECURITY_EVENT_TYPES } = require('../utils/constants');
const logger = require('../utils/logger');
const { query } = require('../config/db');

/**
 * Authenticate JWT token
 * Extracts and verifies JWT token from Authorization header
 */
const authenticate = async (req, res, next) => {
    try {
        // Extract token from Authorization header
        const authHeader = req.headers.authorization;

        if (!authHeader || !authHeader.startsWith('Bearer ')) {
            return res.status(HTTP_STATUS.UNAUTHORIZED).json({
                success: false,
                message: ERROR_MESSAGES.TOKEN_REQUIRED,
            });
        }

        const token = authHeader.substring(7); // Remove 'Bearer ' prefix

        // Verify token
        let decoded;
        try {
            decoded = verifyAccessToken(token);
        } catch (error) {
            logger.warn('Invalid token attempt:', { error: error.message });

            // Log security event
            await createAuditLog({
                action: AUDIT_ACTIONS.ACCESS_DENIED,
                purpose: 'Invalid token',
                ipAddress: req.ip,
                userAgent: req.headers['user-agent'],
                requestMethod: req.method,
                requestPath: req.path,
                statusCode: HTTP_STATUS.UNAUTHORIZED,
            });

            return res.status(HTTP_STATUS.UNAUTHORIZED).json({
                success: false,
                message: ERROR_MESSAGES.INVALID_TOKEN,
            });
        }

        // Check if session is active
        const sessionQuery = `
      SELECT id, is_active, expires_at
      FROM sessions
      WHERE user_id = $1 AND is_active = true
      ORDER BY created_at DESC
      LIMIT 1
    `;

        const sessionResult = await query(sessionQuery, [decoded.userId]);

        if (sessionResult.rows.length === 0) {
            return res.status(HTTP_STATUS.UNAUTHORIZED).json({
                success: false,
                message: 'Session not found or expired',
            });
        }

        const session = sessionResult.rows[0];

        // Check if session has expired
        if (new Date() > new Date(session.expires_at)) {
            // Deactivate expired session
            await query('UPDATE sessions SET is_active = false WHERE id = $1', [session.id]);

            return res.status(HTTP_STATUS.UNAUTHORIZED).json({
                success: false,
                message: 'Session has expired. Please login again',
            });
        }

        // Update last activity
        await query('UPDATE sessions SET last_activity = NOW() WHERE id = $1', [session.id]);

        // Capture device information
        const deviceInfo = captureDeviceInfo(req);

        // Validate device
        const deviceValidation = await validateDevice(decoded.userId, deviceInfo);

        if (!deviceValidation.isTrusted) {
            await flagSuspiciousDevice(decoded.userId, deviceInfo, deviceValidation.reason);

            logger.warn('Suspicious device detected:', {
                userId: decoded.userId,
                deviceInfo,
                reason: deviceValidation.reason,
            });

            // Still allow access but flag for review
            // In production, you might want to require additional verification
        }

        // Periodically check for suspicious patterns (every 10th request to reduce overhead)
        if (Math.random() < 0.1) {
            detectSuspiciousPatterns(decoded.userId).catch(err => {
                logger.error('Pattern detection failed:', err);
            });
        }

        // Get user details
        const user = await findUserById(decoded.userId);

        if (!user) {
            return res.status(HTTP_STATUS.UNAUTHORIZED).json({
                success: false,
                message: ERROR_MESSAGES.USER_NOT_FOUND,
            });
        }

        // Check user status
        if (user.status !== 'active') {
            let message = ERROR_MESSAGES.ACCESS_DENIED;

            if (user.status === 'suspended') {
                message = ERROR_MESSAGES.ACCOUNT_SUSPENDED;
            } else if (user.status === 'pending') {
                message = ERROR_MESSAGES.ACCOUNT_NOT_VERIFIED;
            }

            return res.status(HTTP_STATUS.FORBIDDEN).json({
                success: false,
                message,
            });
        }

        // Attach user and session to request object
        req.user = {
            id: user.id,
            email: user.email,
            phone: user.phone,
            roleId: user.role_id,
            roleName: user.role_name,
            isVerified: user.is_verified,
            status: user.status,
        };

        req.session = {
            id: session.id,
            deviceInfo,
        };

        next();
    } catch (error) {
        logger.error('Authentication middleware error:', error);
        return res.status(HTTP_STATUS.INTERNAL_SERVER_ERROR).json({
            success: false,
            message: ERROR_MESSAGES.INTERNAL_ERROR,
        });
    }
};

/**
 * Optional authentication
 * Authenticates if token is present, but doesn't require it
 */
const optionalAuth = async (req, res, next) => {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
        return next();
    }

    // If token is present, authenticate
    return authenticate(req, res, next);
};

module.exports = {
    authenticate,
    optionalAuth,
};
