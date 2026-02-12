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

// Verify transporter configuration (disabled in development)
if (process.env.NODE_ENV === 'production') {
    transporter.verify((error, success) => {
        if (error) {
            logger.error('Email transporter configuration error:', error);
        } else {
            logger.info('Email server is ready to send messages');
        }
    });
} else {
    logger.info('Email verification skipped in development mode');
}

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

/**
 * Send visit approval email with visit code
 * @param {String} email - Patient email
 * @param {Object} visitData - Visit information
 * @returns {Promise} Send result
 */
const sendVisitApprovalEmail = async (email, visitData) => {
  const { visit_code, hospital_name, reason } = visitData;
  const subject = `Visit Approved - ${hospital_name}`;
  const text = `Your visit has been approved!\n\nVisit Code: ${visit_code}\nHospital: ${hospital_name}\nReason: ${reason}\n\nPlease use this 6-digit code to check in when you arrive at the hospital.`;
  const html = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
      <h2 style="color: #27ae60;">✅ Visit Approved</h2>
      <p>Your visit request has been approved by <strong>${hospital_name}</strong>.</p>
      
      <div style="background-color: #ecf0f1; padding: 20px; border-radius: 8px; margin: 20px 0;">
        <h3 style="margin-top: 0; color: #2c3e50;">Visit Details</h3>
        <p><strong>Visit Code:</strong> <span style="font-size: 48px; color: #27ae60; font-weight: bold; letter-spacing: 8px; display: block; margin: 20px 0;">${visit_code}</span></p>
        <p><strong>Hospital:</strong> ${hospital_name}</p>
        <p><strong>Reason:</strong> ${reason}</p>
      </div>
      
      <div style="background-color: #fff3cd; padding: 15px; border-left: 4px solid #ffc107; margin: 20px 0;">
        <p style="margin: 0;"><strong>📋 Next Steps:</strong></p>
        <ol style="margin: 10px 0;">
          <li>Arrive at the hospital</li>
          <li>Enter your <strong>6-digit visit code ${visit_code}</strong> to check in</li>
          <li>Wait for your assigned doctor</li>
        </ol>
      </div>
      
      <p style="color: #7f8c8d; font-size: 12px;">If you have any questions, please contact ${hospital_name} directly.</p>
    </div>
  `;

  return sendEmail({ to: email, subject, text, html });
};

/**
 * Send visit reminder email
 * @param {String} email - Patient email
 * @param {Object} visitData - Visit information
 * @returns {Promise} Send result
 */
const sendVisitReminderEmail = async (email, visitData) => {
  const { visit_code, hospital_name, scheduled_date } = visitData;
  const subject = `Reminder: Upcoming Visit - ${hospital_name}`;
  const text = `Reminder: You have an upcoming visit.\n\nVisit Code: ${visit_code}\nHospital: ${hospital_name}\nDate: ${scheduled_date}`;
  const html = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
      <h2 style="color: #3498db;">🔔 Visit Reminder</h2>
      <p>This is a reminder about your upcoming visit.</p>
      <p><strong>Visit Code:</strong> ${visit_code}</p>
      <p><strong>Hospital:</strong> ${hospital_name}</p>
      <p><strong>Date:</strong> ${scheduled_date}</p>
    </div>
  `;

  return sendEmail({ to: email, subject, text, html });
};

/**
 * Send visit closure notification
 * @param {String} email - Patient email
 * @param {Object} visitData - Visit information
 * @returns {Promise} Send result
 */
const sendVisitClosureEmail = async (email, visitData) => {
  const { visit_code, hospital_name, status } = visitData;
  const subject = `Visit ${status === 'completed' ? 'Completed' : 'Cancelled'} - ${hospital_name}`;
  const text = `Your visit has been ${status}.\n\nVisit Code: ${visit_code}\nHospital: ${hospital_name}`;
  const html = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
      <h2 style="color: ${status === 'completed' ? '#27ae60' : '#e74c3c'};">
        ${status === 'completed' ? '✅ Visit Completed' : '❌ Visit Cancelled'}
      </h2>
      <p>Your visit at <strong>${hospital_name}</strong> has been ${status}.</p>
      <p><strong>Visit Code:</strong> ${visit_code}</p>
      <p style="color: #7f8c8d; font-size: 12px; margin-top: 20px;">
        ${status === 'completed' ? 'Thank you for choosing our healthcare services.' : 'If you have questions about this cancellation, please contact the hospital.'}
      </p>
    </div>
  `;

  return sendEmail({ to: email, subject, text, html });
};

module.exports = {
  transporter,
  sendEmail,
  sendOTPEmail,
  sendVisitApprovalEmail,
  sendVisitReminderEmail,
  sendVisitClosureEmail,
};
