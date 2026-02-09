const { query } = require('../config/db');
const logger = require('../utils/logger');

/**
 * Create consent when patient verifies OTP and selects access level
 * This automatically grants the assigned doctor access to patient records
 */
class VisitConsentService {
    /**
     * Create automatic consent for visit
     * @param {Object} visit - Visit object with patient, doctor, org details
     * @param {string} accessLevel - 'read' or 'write'
     * @returns {Promise<Object>} Created consent
     */
    static async createConsentForVisit(visit, accessLevel) {
        try {
            if (!visit.assigned_doctor_id) {
                throw new Error('No doctor assigned to visit');
            }

            // Check if consent already exists
            const existingConsent = await query(
                `SELECT * FROM consents 
                 WHERE patient_id = $1 
                 AND recipient_user_id = $2 
                 AND status = 'active'`,
                [visit.patient_id, visit.assigned_doctor_id]
            );

            // If active consent exists, update it
            if (existingConsent.rows.length > 0) {
                const updateResult = await query(
                    `UPDATE consents 
                     SET access_level = $1,
                         purpose = $2,
                         updated_at = CURRENT_TIMESTAMP
                     WHERE id = $3
                     RETURNING *`,
                    [
                        accessLevel,
                        `Hospital visit at ${visit.organization_name || 'hospital'}`,
                        existingConsent.rows[0].id
                    ]
                );

                logger.info(`Updated existing consent for visit ${visit.id}`);
                return updateResult.rows[0];
            }

            // Create new consent
            const endTime = new Date();
            endTime.setDate(endTime.getDate() + 30); // 30 days from now

            const result = await query(
                `INSERT INTO consents (
                    patient_id,
                    recipient_user_id,
                    data_category,
                    purpose,
                    access_level,
                    start_time,
                    end_time,
                    status
                ) VALUES ($1, $2, $3, $4, $5, CURRENT_TIMESTAMP, $6, 'active')
                RETURNING *`,
                [
                    visit.patient_id,
                    visit.assigned_doctor_id,
                    'all',
                    `Hospital visit at ${visit.organization_name || 'hospital'}`,
                    accessLevel,
                    endTime
                ]
            );

            logger.info(`Created consent for visit ${visit.id}: ${result.rows[0].id}`);
            return result.rows[0];

        } catch (error) {
            logger.error('Failed to create visit consent:', error);
            throw error;
        }
    }

    /**
     * Revoke consent when visit is completed or cancelled
     * @param {string} visitId 
     */
    static async revokeConsentForVisit(visitId) {
        try {
            const visitResult = await query(
                'SELECT patient_id, assigned_doctor_id FROM visits WHERE id = $1',
                [visitId]
            );

            if (visitResult.rows.length === 0) {
                throw new Error('Visit not found');
            }

            const visit = visitResult.rows[0];

            await query(
                `UPDATE consents 
                 SET status = 'revoked',
                     updated_at = CURRENT_TIMESTAMP
                 WHERE patient_id = $1 
                 AND recipient_user_id = $2 
                 AND status = 'active'`,
                [visit.patient_id, visit.assigned_doctor_id]
            );

            logger.info(`Revoked consent for completed/cancelled visit ${visitId}`);
        } catch (error) {
            logger.error('Failed to revoke visit consent:', error);
            // Don't throw - this is cleanup, shouldn't block visit completion
        }
    }
}

module.exports = VisitConsentService;
