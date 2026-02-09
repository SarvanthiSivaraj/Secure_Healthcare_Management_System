const nodemailer = require('nodemailer');
const logger = require('../utils/logger');

// Email transporter configuration
const transporter = nodemailer.createTransport({
    host: process.env.EMAIL_HOST || 'smtp.gmail.com',
    port: process.env.EMAIL_PORT || 587,
    secure: process.env.EMAIL_SECURE === 'true', // true for 465, false for other ports
    auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASSWORD,
    },
});

// Verify transporter configuration
transporter.verify((error, success) => {
    if (error) {
        logger.error('Email transporter configuration error:', error);
    } else {
        logger.info('Email server is ready to send messages');
    }
});

/**
 * Send email
 * @param {Object} options - Email options
 * @param {String} options.to - Recipient email
 * @param {String} options.subject - Email subject
 * @param {String} options.text - Plain text content
 * @param {String} options.html - HTML content
 * @returns {Promise} Send result
 */
const sendEmail = async ({ to, subject, text, html }) => {
    try {
        const mailOptions = {
            from: process.env.EMAIL_FROM || 'noreply@healthcare.com',
            to,
            subject,
            text,
            html,
        };

        const info = await transporter.sendMail(mailOptions);
        logger.info('Email sent successfully:', { to, subject, messageId: info.messageId });
        return info;
    } catch (error) {
        if (process.env.NODE_ENV === 'development') {
            logger.warn(`⚠️ Email sending failed (Dev Mode Ignored): ${error.message}`);
            return { messageId: 'mock-id' };
        }
        logger.error('Email sending failed:', { to, subject, error: error.message });
        throw error;
    }
};

/**
 * Send OTP email
 * @param {String} email - Recipient email
 * @param {String} otp - OTP code
 * @param {String} purpose - Purpose of OTP
 * @returns {Promise} Send result
 */
const sendOTPEmail = async (email, otp, purpose = 'verification') => {
    const subject = 'Your Healthcare System Verification Code';
    const text = `Your OTP for ${purpose} is: ${otp}. This code will expire in ${process.env.OTP_EXPIRY_MINUTES || 10} minutes.`;
    const html = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
      <h2 style="color: #2c3e50;">Healthcare System</h2>
      <p>Your verification code for ${purpose} is:</p>
      <div style="background-color: #f0f0f0; padding: 20px; text-align: center; font-size: 32px; font-weight: bold; letter-spacing: 5px; margin: 20px 0;">
        ${otp}
      </div>
      <p style="color: #7f8c8d;">This code will expire in ${process.env.OTP_EXPIRY_MINUTES || 10} minutes.</p>
      <p style="color: #e74c3c; font-size: 12px;">If you did not request this code, please ignore this email.</p>
    </div>
  `;

    return sendEmail({ to: email, subject, text, html });
};

module.exports = {
    transporter,
    sendEmail,
    sendOTPEmail,
};
