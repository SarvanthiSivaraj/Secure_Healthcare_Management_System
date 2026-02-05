const StaffInvitation = require('../models/staff_invitation.model');
const AccountAction = require('../models/account_action.model');
const logger = require('../utils/logger');
const nodemailer = require('nodemailer');

/**
 * Staff Invitation Service
 * Handles email-based staff invitation workflow
 */
class StaffInvitationService {
    /**
     * Send staff invitation email
     */
    static async sendInvitationEmail(invitation, inviterName) {
        try {
            // Configure email transporter (using environment variables)
            const transporter = nodemailer.createTransporter({
                host: process.env.SMTP_HOST || 'smtp.gmail.com',
                port: process.env.SMTP_PORT || 587,
                secure: false,
                auth: {
                    user: process.env.SMTP_USER,
                    pass: process.env.SMTP_PASS
                }
            });

            const invitationUrl = `${process.env.FRONTEND_URL || 'http://localhost:3000'}/accept-invitation/${invitation.token}`;

            const mailOptions = {
                from: process.env.SMTP_FROM || 'noreply@healthcare.com',
                to: invitation.email,
                subject: 'You\'re Invited to Join Our Healthcare Team',
                html: `
                    <h2>Welcome to Our Healthcare Team!</h2>
                    <p>Hi there,</p>
                    <p>${inviterName} has invited you to join our healthcare management system as a <strong>${invitation.role}</strong>.</p>
                    ${invitation.invitation_message ? `<p><em>"${invitation.invitation_message}"</em></p>` : ''}
                    <p>Click the button below to accept your invitation and create your account:</p>
                    <p style="margin: 30px 0;">
                        <a href="${invitationUrl}" style="background-color: #4CAF50; color: white; padding: 14px 28px; text-decoration: none; border-radius: 4px; display: inline-block;">
                            Accept Invitation
                        </a>
                    </p>
                    <p>Or copy and paste this link into your browser:</p>
                    <p><a href="${invitationUrl}">${invitationUrl}</a></p>
                    <p><strong>This invitation will expire on ${new Date(invitation.expires_at).toLocaleDateString()}.</strong></p>
                    <p>If you have any questions, please contact your administrator.</p>
                    <hr>
                    <p style="color: #666; font-size: 12px;">This is an automated email. Please do not reply.</p>
                `
            };

            await transporter.sendMail(mailOptions);
            logger.info(`Invitation email sent to ${invitation.email}`);
        } catch (error) {
            logger.error('Error sending invitation email:', error);
            // Don't throw - invitation is created even if email fails
        }
    }

    /**
     * Invite a new staff member
     */
    static async inviteStaff({ email, role, invitedBy, invitationMessage = null, inviterName }) {
        try {
            // Check if email already has a pending invitation
            const hasPending = await StaffInvitation.hasPendingInvitation(email);
            if (hasPending) {
                throw new Error('This email already has a pending invitation');
            }

            // Check if user already exists
            const db = require('../config/db');
            const userCheck = await db.query('SELECT id FROM users WHERE email = $1', [email]);
            if (userCheck.rows.length > 0) {
                throw new Error('A user with this email already exists');
            }

            // Create invitation
            const invitation = await StaffInvitation.create({
                email,
                role,
                invitedBy,
                invitationMessage,
                expiresInDays: 7
            });

            // Send invitation email
            await this.sendInvitationEmail(invitation, inviterName);

            // Log the action
            await AccountAction.log({
                userId: invitedBy,
                actionType: 'invite',
                actionBy: invitedBy,
                notes: `Invited ${email} as ${role}`,
                metadata: { email, role, invitationId: invitation.id }
            });

            logger.info(`Staff invitation created for ${email} by ${invitedBy}`);
            return invitation;
        } catch (error) {
            logger.error('Error inviting staff:', error);
            throw error;
        }
    }

    /**
     * Validate invitation token
     */
    static async validateInvitation(token) {
        try {
            const validation = await StaffInvitation.validate(token);
            return validation;
        } catch (error) {
            logger.error('Error validating invitation:', error);
            throw error;
        }
    }

    /**
     * Accept invitation and create user account
     */
    static async acceptInvitation(token, userData) {
        try {
            // Validate invitation
            const validation = await StaffInvitation.validate(token);
            if (!validation.valid) {
                throw new Error(validation.reason);
            }

            const invitation = validation.invitation;

            // Create user account
            const db = require('../config/db');
            const userQuery = `
                INSERT INTO users (email, password, first_name, last_name, role, account_status, verification_status)
                VALUES ($1, $2, $3, $4, $5, 'active', 'unverified')
                RETURNING *;
            `;

            const userValues = [
                invitation.email,
                userData.password, // Should be hashed by controller
                userData.firstName,
                userData.lastName,
                invitation.role
            ];

            const userResult = await db.query(userQuery, userValues);
            const newUser = userResult.rows[0];

            // Mark invitation as accepted
            await StaffInvitation.accept(token, newUser.id);

            // Log the action
            await AccountAction.log({
                userId: newUser.id,
                actionType: 'invite',
                actionBy: invitation.invited_by,
                notes: 'Invitation accepted and account created',
                metadata: { invitationId: invitation.id }
            });

            logger.info(`Invitation accepted by ${newUser.email}`);
            return newUser;
        } catch (error) {
            logger.error('Error accepting invitation:', error);
            throw error;
        }
    }

    /**
     * Resend invitation email
     */
    static async resendInvitation(invitationId, inviterName) {
        try {
            const invitation = await StaffInvitation.getById(invitationId);

            if (!invitation) {
                throw new Error('Invitation not found');
            }

            if (invitation.status !== 'pending') {
                throw new Error(`Cannot resend ${invitation.status} invitation`);
            }

            // Send email again
            await this.sendInvitationEmail(invitation, inviterName);

            logger.info(`Invitation resent to ${invitation.email}`);
            return invitation;
        } catch (error) {
            logger.error('Error resending invitation:', error);
            throw error;
        }
    }

    /**
     * Cancel an invitation
     */
    static async cancelInvitation(invitationId, cancelledBy, reason = null) {
        try {
            const invitation = await StaffInvitation.cancel(invitationId, cancelledBy, reason);

            if (!invitation) {
                throw new Error('Invitation not found or already processed');
            }

            // Log the action
            await AccountAction.log({
                userId: cancelledBy,
                actionType: 'cancel_invite',
                actionBy: cancelledBy,
                reason: reason || 'Invitation cancelled',
                metadata: { invitationId, email: invitation.email }
            });

            logger.info(`Invitation ${invitationId} cancelled by ${cancelledBy}`);
            return invitation;
        } catch (error) {
            logger.error('Error cancelling invitation:', error);
            throw error;
        }
    }

    /**
     * Get all invitations (with filters)
     */
    static async getInvitations(filters = {}) {
        try {
            return await StaffInvitation.getAll(filters);
        } catch (error) {
            logger.error('Error getting invitations:', error);
            throw error;
        }
    }

    /**
     * Get invitation statistics
     */
    static async getStats(invitedBy = null) {
        try {
            return await StaffInvitation.getStats(invitedBy);
        } catch (error) {
            logger.error('Error getting invitation stats:', error);
            throw error;
        }
    }

    /**
     * Clean up expired invitations (scheduled job)
     */
    static async cleanupExpired() {
        try {
            const count = await StaffInvitation.cleanupExpired();
            logger.info(`Marked ${count} expired invitations`);
            return count;
        } catch (error) {
            logger.error('Error cleaning up expired invitations:', error);
            throw error;
        }
    }
}

module.exports = StaffInvitationService;
