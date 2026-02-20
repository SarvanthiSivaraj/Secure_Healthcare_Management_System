const StaffInvitation = require('../models/staff_invitation.model');
const AccountAction = require('../models/account_action.model');
const logger = require('../utils/logger');
const { sendEmail } = require('../config/mail');

/**
 * Staff Invitation Service
 * Handles email-based staff invitation workflow
 */
class StaffInvitationService {
    static async sendInvitationEmail(invitation, inviterName) {
        try {
            const invitationUrl = `${process.env.FRONTEND_URL || 'http://localhost:3000'}/staff/invitation/${invitation.token}`;

            const mailOptions = {
                from: process.env.EMAIL_FROM || 'noreply@healthcare.com',
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

            await sendEmail({
                to: invitation.email,
                subject: 'You\'re Invited to Join Our Healthcare Team',
                html: mailOptions.html,
                text: `Hi there, ${inviterName} has invited you to join our healthcare management system as a ${invitation.role}. Accept your invitation here: ${invitationUrl}`
            });
            logger.info(`Invitation email sent to ${invitation.email}`);
        } catch (error) {
            logger.error('Error sending invitation email:', error);
            // Don't throw - invitation is created even if email fails
        }
    }

    /**
     * Send welcome email with login details
     */
    static async sendWelcomeEmail(user, role) {
        try {
            const loginUrl = `${process.env.FRONTEND_URL || 'http://localhost:3000'}/login`;

            const mailOptions = {
                from: process.env.EMAIL_FROM || 'noreply@healthcare.com',
                to: user.email,
                subject: 'Welcome to Secure Healthcare - Account Activated',
                html: `
                    <h2>Account Activated Successfully!</h2>
                    <p>Hello ${user.first_name},</p>
                    <p>Your account has been successfully created and activated.</p>
                    
                    <div style="background-color: #f5f5f5; padding: 15px; border-radius: 5px; margin: 20px 0;">
                        <p><strong>Username/Email:</strong> ${user.email}</p>
                        <p><strong>Role:</strong> ${role}</p>
                        <p><em>(You have already set your password during registration)</em></p>
                    </div>

                    <p>You can now log in to the system:</p>
                    <p style="margin: 30px 0;">
                        <a href="${loginUrl}" style="background-color: #007bff; color: white; padding: 14px 28px; text-decoration: none; border-radius: 4px; display: inline-block;">
                            Login to Dashboard
                        </a>
                    </p>
                    
                    <p>If you have any issues, please contact the administrator.</p>
                `
            };

            await sendEmail({
                to: user.email,
                subject: 'Welcome to Secure Healthcare - Account Activated',
                html: mailOptions.html,
                text: `Hello ${user.first_name}, Your account has been successfully created and activated. You can now log in at ${loginUrl}`
            });
            logger.info(`Welcome email sent to ${user.email}`);
        } catch (error) {
            logger.error('Error sending welcome email:', error);
            // Don't throw - non-critical
        }
    }

    /**
     * Invite a new staff member
     */
    static async inviteStaff({ email, role, organizationId, invitedBy, invitationMessage = null, inviterName }) {
        try {
            // Check if email already has a pending invitation
            const hasPending = await StaffInvitation.hasPendingInvitation(email);
            if (hasPending) {
                throw new Error('This email already has a pending invitation');
            }

            const db = require('../config/db');

            // Check if user already exists
            const userCheck = await db.query('SELECT id FROM users WHERE email = $1', [email]);
            let userId;

            if (userCheck.rows.length > 0) {
                // User exists - maybe inactive or existing user?
                // For now, we assume we are just inviting them to a new role/org?
                // But the requirement says "register from start", implying new users.
                // If user exists, we'll just link them? 
                // But let's follow the requirement: "make sure they are active and role is shown correctly"
                // If they exist, they are likely already shown.
                // We'll proceed to create invitation, but we won't create a NEW user.
                userId = userCheck.rows[0].id;
                // Ensure they are pending if they are not active? Or leave as is?
                // For invitation flow, they should probably be 'pending' if they were 'active'?
                // Actually, if they exist, they might be already active. Let's not force status change if they exist.
            } else {
                // Create new user immediately as PENDING
                // Generate random password
                const randomPassword = require('crypto').randomBytes(8).toString('hex');
                const { hashPassword } = require('../services/encryption.service');
                const passwordHash = await hashPassword(randomPassword);

                // Get role ID
                const roleRes = await db.query('SELECT id FROM roles WHERE name = $1', [role.toLowerCase()]);
                if (roleRes.rows.length === 0) {
                    throw new Error(`Invalid role: ${role}`);
                }
                const roleId = roleRes.rows[0].id;

                const userQuery = `
                    INSERT INTO users (email, password_hash, role_id, is_verified, status, first_name, last_name)
                    VALUES ($1, $2, $3, false, 'pending', 'Staff', 'Member')
                    RETURNING id;
                `;
                // Default name 'Staff Member' until they accept and update it

                const userResult = await db.query(userQuery, [email, passwordHash, roleId]);
                userId = userResult.rows[0].id;
            }

            // Create/Ensure Staff Organization Mapping
            if (organizationId) {
                // Check if mapping exists
                const mappingCheck = await db.query(
                    'SELECT id FROM staff_org_mapping WHERE user_id = $1 AND organization_id = $2',
                    [userId, organizationId]
                );

                if (mappingCheck.rows.length === 0) {
                    // Get role ID again if needed (or pass it)
                    const roleRes = await db.query('SELECT id FROM roles WHERE name = $1', [role.toLowerCase()]);
                    const roleId = roleRes.rows[0].id;

                    await db.query(
                        `INSERT INTO staff_org_mapping (user_id, organization_id, role_id, status)
                         VALUES ($1, $2, $3, 'active')`,
                        [userId, organizationId, roleId]
                    );
                }
            }

            // Create invitation
            const invitation = await StaffInvitation.create({
                email,
                role,
                organizationId,
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
                metadata: { email, role, invitationId: invitation.id, createdUserId: userId }
            });

            logger.info(`Staff invitation created for ${email} by ${invitedBy}. Pre-created user ${userId}.`);
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
     * Accept invitation and update user account
     */
    static async acceptInvitation(token, userData) {
        try {
            // Validate invitation
            const validation = await StaffInvitation.validate(token);
            if (!validation.valid) {
                throw new Error(validation.reason);
            }

            const invitation = validation.invitation;
            const db = require('../config/db');

            // Find existing user by email
            const userRes = await db.query('SELECT id FROM users WHERE email = $1', [invitation.email]);
            let userId;

            if (userRes.rows.length > 0) {
                // Update existing user
                userId = userRes.rows[0].id;
                const { hashPassword } = require('../services/encryption.service');
                const passwordHash = await hashPassword(userData.password);

                await db.query(
                    `UPDATE users 
                     SET password_hash = $1, first_name = $2, last_name = $3, status = 'active', is_verified = true
                     WHERE id = $4`,
                    [passwordHash, userData.firstName, userData.lastName, userId]
                );
            } else {
                // Should not happen if inviteStaff pre-created user, but fallback just in case
                // Insert new user logic (same as before)
                const { hashPassword } = require('../services/encryption.service');
                const passwordHash = await hashPassword(userData.password);

                const roleRes = await db.query('SELECT id FROM roles WHERE name = $1', [invitation.role.toLowerCase()]);
                const roleId = roleRes.rows[0].id;

                const userResult = await db.query(
                    `INSERT INTO users (email, password_hash, first_name, last_name, role_id, is_verified, status)
                     VALUES ($1, $2, $3, $4, $5, true, 'active')
                     RETURNING id`,
                    [invitation.email, passwordHash, userData.firstName, userData.lastName, roleId]
                );
                userId = userResult.rows[0].id;

                // Create mapping if needed...
                if (invitation.organization_id) {
                    await db.query(
                        `INSERT INTO staff_org_mapping (user_id, organization_id, role_id, status)
                         VALUES ($1, $2, $3, 'active')`,
                        [userId, invitation.organization_id, roleId]
                    );
                }
            }

            // Mark invitation as accepted
            await StaffInvitation.accept(token, userId);

            // Fetch final user object
            const finalUserRes = await db.query('SELECT * FROM users WHERE id = $1', [userId]);
            const finalUser = finalUserRes.rows[0];

            // Log the action
            await AccountAction.log({
                userId: userId,
                actionType: 'invite_accept',
                actionBy: userId,
                notes: 'Invitation accepted and account setup completed',
                metadata: { invitationId: invitation.id }
            });

            // Send Welcome Email
            await this.sendWelcomeEmail(finalUser, invitation.role);

            logger.info(`Invitation accepted by ${finalUser.email}`);
            return finalUser;
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
            let invitation = await StaffInvitation.getById(invitationId);

            if (!invitation) {
                throw new Error('Invitation not found');
            }

            // For expired or cancelled invitations, reset them to pending with a new token
            const allowedStatuses = ['pending', 'expired', 'cancelled'];
            if (!allowedStatuses.includes(invitation.status)) {
                throw new Error(`Cannot resend ${invitation.status} invitation`);
            }

            // Reset if expired or cancelled
            if (invitation.status === 'expired' || invitation.status === 'cancelled') {
                invitation = await StaffInvitation.resetForResend(invitationId);
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
    static async getStats(filters = {}) {
        try {
            return await StaffInvitation.getStats(filters);
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
