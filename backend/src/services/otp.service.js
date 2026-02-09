const { query } = require('../config/db');
const { generateOTP } = require('../utils/idGenerator');
const { hashOTP } = require('./encryption.service');
const { sendOTPEmail } = require('../config/mail');
const config = require('../config/env');
const logger = require('../utils/logger');
const { OTP_PURPOSE } = require('../utils/constants');

/**
 * Generate and send OTP
 * @param {Object} params - OTP parameters
 * @param {String} params.email - User email (optional)
 * @param {String} params.phone - User phone (optional)
 * @param {String} params.userId - User ID (optional)
 * @param {String} params.purpose - OTP purpose
 * @returns {Promise<Object>} OTP generation result
 */
const generateAndSendOTP = async ({ email, phone, userId, purpose }) => {
    try {
        // Validate input
        if (!email && !phone) {
            throw new Error('Either email or phone is required');
        }

        if (!Object.values(OTP_PURPOSE).includes(purpose)) {
            throw new Error('Invalid OTP purpose');
        }

        // Check rate limiting - max 3 OTPs per hour
        const rateLimitQuery = `
      SELECT COUNT(*) as count
      FROM otp_verifications
      WHERE ${email ? 'email = $1' : 'phone = $1'}
        AND created_at > NOW() - INTERVAL '1 hour'
        AND is_verified = false
    `;
        const rateLimitResult = await query(rateLimitQuery, [email || phone]);

        if (parseInt(rateLimitResult.rows[0].count) >= config.otp.maxAttempts) {
            throw new Error('Too many OTP requests. Please try again later');
        }

        // Generate OTP
        const otp = generateOTP(config.otp.length);
        const otpHash = hashOTP(otp);

        // Calculate expiry time
        const expiryMinutes = config.otp.expiryMinutes;

        // Store OTP in database
        const insertQuery = `
      INSERT INTO otp_verifications (
        user_id, email, phone, otp_hash, purpose, expires_at
      ) VALUES ($1, $2, $3, $4, $5, NOW() + INTERVAL '${expiryMinutes} minutes')
      RETURNING id, expires_at
    `;

        const result = await query(insertQuery, [
            userId || null,
            email || null,
            phone || null,
            otpHash,
            purpose,
        ]);

        // Send OTP via email (or SMS if phone)
        if (email) {
            if (process.env.NODE_ENV === 'development') {
                logger.info('------------------------------------------');
                logger.info(`🔑 DEV MODE OTP: ${otp} (for ${email})`);
                logger.info('------------------------------------------');
            }
            await sendOTPEmail(email, otp, purpose);
            logger.info('OTP sent via email', { email, purpose });
        } else if (phone) {
            // TODO: Implement SMS sending
            logger.info('OTP generated for phone (SMS not implemented)', { phone, purpose, otp });
        }

        return {
            success: true,
            message: 'OTP sent successfully',
            otpId: result.rows[0].id,
            expiresAt: result.rows[0].expires_at,
            // For development only - remove in production
            ...(process.env.NODE_ENV === 'development' && { otp }),
        };
    } catch (error) {
        logger.error('OTP generation failed:', error);
        throw error;
    }
};

/**
 * Verify OTP
 * @param {Object} params - Verification parameters
 * @param {String} params.email - User email (optional)
 * @param {String} params.phone - User phone (optional)
 * @param {String} params.otp - OTP code
 * @param {String} params.purpose - OTP purpose
 * @returns {Promise<Object>} Verification result
 */
const verifyOTP = async ({ email, phone, otp, purpose }) => {
    try {
        // Validate input
        if (!email && !phone) {
            throw new Error('Either email or phone is required');
        }

        if (!otp) {
            throw new Error('OTP is required');
        }

        const otpHash = hashOTP(otp);

        // Find OTP record
        const findQuery = `
      SELECT id, user_id, attempts, is_verified, expires_at
      FROM otp_verifications
      WHERE ${email ? 'email = $1' : 'phone = $1'}
        AND otp_hash = $2
        AND purpose = $3
        AND is_verified = false
      ORDER BY created_at DESC
      LIMIT 1
    `;

        const result = await query(findQuery, [email || phone, otpHash, purpose]);

        if (result.rows.length === 0) {
            // Increment failed attempts
            const updateAttemptsQuery = `
        UPDATE otp_verifications
        SET attempts = attempts + 1
        WHERE ${email ? 'email = $1' : 'phone = $1'}
          AND purpose = $2
          AND is_verified = false
          AND created_at = (
            SELECT MAX(created_at)
            FROM otp_verifications
            WHERE ${email ? 'email = $1' : 'phone = $1'}
              AND purpose = $2
          )
      `;
            await query(updateAttemptsQuery, [email || phone, purpose]);

            throw new Error('Invalid OTP code');
        }

        const otpRecord = result.rows[0];

        // Check if OTP has expired
        if (new Date() > new Date(otpRecord.expires_at)) {
            throw new Error('OTP has expired');
        }

        // Check max attempts
        if (otpRecord.attempts >= config.otp.maxAttempts) {
            throw new Error('Maximum OTP verification attempts exceeded');
        }

        // Mark OTP as verified
        const updateQuery = `
      UPDATE otp_verifications
      SET is_verified = true
      WHERE id = $1
      RETURNING user_id
    `;

        const updateResult = await query(updateQuery, [otpRecord.id]);

        logger.info('OTP verified successfully', { email, phone, purpose });

        return {
            success: true,
            message: 'OTP verified successfully',
            userId: updateResult.rows[0].user_id,
        };
    } catch (error) {
        logger.error('OTP verification failed:', error);
        throw error;
    }
};

/**
 * Clean up expired OTPs (to be called by cron job)
 * @returns {Promise<Number>} Number of deleted records
 */
const cleanupExpiredOTPs = async () => {
    try {
        const deleteQuery = `
      DELETE FROM otp_verifications
      WHERE expires_at < NOW()
        OR (is_verified = true AND created_at < NOW() - INTERVAL '24 hours')
    `;

        const result = await query(deleteQuery);
        logger.info(`Cleaned up ${result.rowCount} expired OTP records`);

        return result.rowCount;
    } catch (error) {
        logger.error('OTP cleanup failed:', error);
        throw error;
    }
};

module.exports = {
    generateAndSendOTP,
    verifyOTP,
    cleanupExpiredOTPs,
};
