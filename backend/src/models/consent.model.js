const { query } = require('../config/db');
const logger = require('../utils/logger');

/**
 * Grant new consent
 * @param {Object} consentData - Consent data
 * @returns {Promise<Object>} Created consent
 */
const createConsent = async (consentData) => {
    try {
        const {
            patientId,
            recipientUserId,
            dataCategory,
            purpose,
            accessLevel,
            startTime,
            endTime,
        } = consentData;

        const insertQuery = `
            INSERT INTO consents (
                patient_id,
                recipient_user_id,
                data_category,
                purpose,
                access_level,
                start_time,
                end_time,
                status,
                created_at,
                updated_at
            ) VALUES ($1, $2, $3, $4, $5, $6, $7, 'active', NOW(), NOW())
            RETURNING *
        `;

        const result = await query(insertQuery, [
            patientId,
            recipientUserId,
            dataCategory,
            purpose,
            accessLevel,
            startTime || new Date(),
            endTime || null,
        ]);

        return result.rows[0];
    } catch (error) {
        logger.error('Failed to create consent:', error);
        throw error;
    }
};

/**
 * Revoke consent
 * @param {String} consentId - Consent ID
 * @param {String} patientId - Patient ID (for validation)
 * @returns {Promise<Object>} Updated consent
 */
const revokeConsent = async (consentId, patientId) => {
    try {
        const updateQuery = `
            UPDATE consents 
            SET status = 'revoked', updated_at = NOW()
            WHERE id = $1 AND patient_id = $2
            RETURNING *
        `;

        const result = await query(updateQuery, [consentId, patientId]);
        return result.rows[0];
    } catch (error) {
        logger.error('Failed to revoke consent:', error);
        throw error;
    }
};

/**
 * Get active consents for patient
 * @param {String} patientId - Patient ID
 * @returns {Promise<Array>} List of active consents
 */
const getActiveConsents = async (patientId) => {
    try {
        const selectQuery = `
            SELECT 
                c.id,
                c.recipient_user_id,
                c.data_category,
                c.purpose,
                c.access_level,
                c.start_time,
                c.end_time,
                c.status,
                c.created_at,
                u.email as recipient_email,
                r.name as recipient_role
            FROM consents c
            INNER JOIN users u ON c.recipient_user_id = u.id
            INNER JOIN roles r ON u.role_id = r.id
            WHERE c.patient_id = $1 
                AND c.status = 'active'
                AND (c.end_time IS NULL OR c.end_time > NOW())
            ORDER BY c.created_at DESC
        `;

        const result = await query(selectQuery, [patientId]);
        return result.rows;
    } catch (error) {
        logger.error('Failed to get active consents:', error);
        throw error;
    }
};

/**
 * Get consent history for patient
 * @param {String} patientId - Patient ID
 * @returns {Promise<Array>} List of consent history
 */
const getConsentHistory = async (patientId) => {
    try {
        const selectQuery = `
            SELECT 
                c.id,
                c.recipient_user_id,
                c.data_category,
                c.purpose,
                c.access_level,
                c.start_time,
                c.end_time,
                c.status,
                c.created_at,
                c.updated_at,
                u.email as recipient_email,
                r.name as recipient_role
            FROM consents c
            INNER JOIN users u ON c.recipient_user_id = u.id
            INNER JOIN roles r ON u.role_id = r.id
            WHERE c.patient_id = $1
            ORDER BY c.created_at DESC
        `;

        const result = await query(selectQuery, [patientId]);
        return result.rows;
    } catch (error) {
        logger.error('Failed to get consent history:', error);
        throw error;
    }
};

/**
 * Check if active consent exists
 * @param {String} patientId - Patient ID
 * @param {String} recipientUserId - Recipient User ID
 * @param {String} dataCategory - Data Category
 * @param {String} accessLevel - Access Level ('read' or 'write')
 * @returns {Promise<Boolean>} True if consent exists
 */
const checkConsent = async (patientId, recipientUserId, dataCategory, accessLevel = 'read') => {
    try {
        const checkQuery = `
            SELECT 1 
            FROM consents 
            WHERE patient_id = $1 
                AND recipient_user_id = $2
                AND data_category = $3
                AND (access_level = $4 OR access_level = 'write') -- write grants read access too
                AND status = 'active'
                AND (end_time IS NULL OR end_time > NOW())
        `;

        const result = await query(checkQuery, [patientId, recipientUserId, dataCategory, accessLevel]);
        return result.rows.length > 0;
    } catch (error) {
        logger.error('Failed to check consent:', error);
        throw error;
    }
};

/**
 * Find consent by ID
 * @param {String} consentId - Consent ID
 * @returns {Promise<Object>} Consent object
 */
const findConsentById = async (consentId) => {
    try {
        const result = await query('SELECT * FROM consents WHERE id = $1', [consentId]);
        return result.rows[0];
    } catch (error) {
        logger.error('Failed to find consent by ID:', error);
        throw error;
    }
};

module.exports = {
    createConsent,
    revokeConsent,
    getActiveConsents,
    getConsentHistory,
    checkConsent,
    findConsentById,
};
