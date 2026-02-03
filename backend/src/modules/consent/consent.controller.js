const {
    createConsent,
    revokeConsent: revokeConsentModel,
    getActiveConsents: getActiveConsentsModel,
    getConsentHistory: getConsentHistoryModel,
    findConsentById
} = require('../../models/consent.model');
const { query } = require('../../config/db'); // Kept for user check
const { createAuditLog } = require('../../services/audit.service');
const { HTTP_STATUS, SUCCESS_MESSAGES, ERROR_MESSAGES, AUDIT_ACTIONS } = require('../../utils/constants');
const { validateRequiredFields } = require('../../utils/validators');
const logger = require('../../utils/logger');

/**
 * Get active consents for current patient
 * GET /api/consent/active
 */
const getActiveConsents = async (req, res) => {
    try {
        const userId = req.user.id;
        const consents = await getActiveConsentsModel(userId);

        // Audit log
        await createAuditLog({
            userId,
            action: AUDIT_ACTIONS.CONSENT_VIEW,
            entityType: 'consent',
            purpose: 'View active consents',
            ipAddress: req.ip,
            userAgent: req.headers['user-agent'],
            requestMethod: req.method,
            requestPath: req.path,
            statusCode: HTTP_STATUS.OK,
        });

        res.status(HTTP_STATUS.OK).json({
            success: true,
            data: consents,
        });
    } catch (error) {
        logger.error('Get active consents failed:', error);
        res.status(HTTP_STATUS.INTERNAL_SERVER_ERROR).json({
            success: false,
            message: ERROR_MESSAGES.INTERNAL_ERROR,
        });
    }
};

/**
 * Get consent history for current patient
 * GET /api/consent/history
 */
const getConsentHistory = async (req, res) => {
    try {
        const userId = req.user.id;
        const consents = await getConsentHistoryModel(userId);

        // Audit log
        await createAuditLog({
            userId,
            action: AUDIT_ACTIONS.CONSENT_VIEW,
            entityType: 'consent',
            purpose: 'View consent history',
            ipAddress: req.ip,
            userAgent: req.headers['user-agent'],
            requestMethod: req.method,
            requestPath: req.path,
            statusCode: HTTP_STATUS.OK,
        });

        res.status(HTTP_STATUS.OK).json({
            success: true,
            data: consents,
        });
    } catch (error) {
        logger.error('Get consent history failed:', error);
        res.status(HTTP_STATUS.INTERNAL_SERVER_ERROR).json({
            success: false,
            message: ERROR_MESSAGES.INTERNAL_ERROR,
        });
    }
};

/**
 * Grant new consent
 * POST /api/consent/grant
 */
const grantConsent = async (req, res) => {
    try {
        const patientId = req.user.id;
        const {
            recipientUserId,
            dataCategory,
            purpose,
            accessLevel,
            startTime,
            endTime,
        } = req.body;

        // Validate required fields
        const validation = validateRequiredFields(req.body, [
            'recipientUserId',
            'dataCategory',
            'purpose',
            'accessLevel',
        ]);

        if (!validation.isValid) {
            return res.status(HTTP_STATUS.BAD_REQUEST).json({
                success: false,
                message: ERROR_MESSAGES.REQUIRED_FIELDS_MISSING,
                missing: validation.missing,
            });
        }

        // Validate consent data (purpose, category, access level)
        const { validateConsentData } = require('../../utils/consent.validator');
        const consentValidation = validateConsentData(req.body);

        if (!consentValidation.isValid) {
            return res.status(HTTP_STATUS.BAD_REQUEST).json({
                success: false,
                message: 'Invalid consent data',
                errors: consentValidation.errors,
            });
        }

        // Check if recipient exists and is a doctor/staff
        // We still need a direct query here or a user model method for this specific check
        const recipientCheck = await query(
            `SELECT u.id, r.name as role_name 
             FROM users u 
             INNER JOIN roles r ON u.role_id = r.id 
             WHERE u.id = $1 AND u.status = 'active'`,
            [recipientUserId]
        );

        if (recipientCheck.rows.length === 0) {
            return res.status(HTTP_STATUS.BAD_REQUEST).json({
                success: false,
                message: 'Recipient user not found or inactive',
            });
        }

        const consent = await createConsent({
            patientId,
            recipientUserId,
            dataCategory,
            purpose,
            accessLevel,
            startTime,
            endTime
        });

        // Audit log
        await createAuditLog({
            userId: patientId,
            action: AUDIT_ACTIONS.CONSENT_GRANT,
            entityType: 'consent',
            entityId: consent.id,
            purpose: `Grant consent to user ${recipientUserId} for ${purpose}`,
            ipAddress: req.ip,
            userAgent: req.headers['user-agent'],
            requestMethod: req.method,
            requestPath: req.path,
            statusCode: HTTP_STATUS.CREATED,
        });

        logger.info('Consent granted:', {
            consentId: consent.id,
            patientId,
            recipientUserId,
            dataCategory,
            purpose,
        });

        res.status(HTTP_STATUS.CREATED).json({
            success: true,
            message: SUCCESS_MESSAGES.CONSENT_GRANTED,
            data: consent,
        });
    } catch (error) {
        logger.error('Grant consent failed:', error);
        res.status(HTTP_STATUS.INTERNAL_SERVER_ERROR).json({
            success: false,
            message: ERROR_MESSAGES.INTERNAL_ERROR,
            error: process.env.NODE_ENV === 'development' ? error.message : undefined,
        });
    }
};

/**
 * Revoke consent
 * PUT /api/consent/revoke/:consentId
 */
const revokeConsent = async (req, res) => {
    try {
        const patientId = req.user.id;
        const { consentId } = req.params;

        // Check if consent exists
        const consent = await findConsentById(consentId);

        if (!consent) {
            return res.status(HTTP_STATUS.NOT_FOUND).json({
                success: false,
                message: 'Consent not found',
            });
        }

        if (consent.patient_id !== patientId) {
            return res.status(HTTP_STATUS.NOT_FOUND).json({
                success: false,
                message: 'Consent not found or does not belong to you',
            });
        }

        if (consent.status === 'revoked') {
            return res.status(HTTP_STATUS.BAD_REQUEST).json({
                success: false,
                message: 'Consent is already revoked',
            });
        }

        // Revoke consent
        const revokedConsent = await revokeConsentModel(consentId, patientId);

        // Audit log
        await createAuditLog({
            userId: patientId,
            action: AUDIT_ACTIONS.CONSENT_REVOKE,
            entityType: 'consent',
            entityId: consentId,
            purpose: `Revoke consent for ${consent.purpose}`,
            ipAddress: req.ip,
            userAgent: req.headers['user-agent'],
            requestMethod: req.method,
            requestPath: req.path,
            statusCode: HTTP_STATUS.OK,
        });

        logger.info('Consent revoked:', {
            consentId,
            patientId,
            recipientUserId: consent.recipient_user_id,
        });

        res.status(HTTP_STATUS.OK).json({
            success: true,
            message: SUCCESS_MESSAGES.CONSENT_REVOKED,
            data: revokedConsent,
        });
    } catch (error) {
        logger.error('Revoke consent failed:', error);
        res.status(HTTP_STATUS.INTERNAL_SERVER_ERROR).json({
            success: false,
            message: ERROR_MESSAGES.INTERNAL_ERROR,
        });
    }
};

module.exports = {
    getActiveConsents,
    getConsentHistory,
    grantConsent,
    revokeConsent,
};
