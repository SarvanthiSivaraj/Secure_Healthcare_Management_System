const { findUserById, getAllUsers, updateUserStatus } = require('../../models/user.model');
const { createStaffMapping, deactivateStaffMapping, verifyStaffLicense, getUserStaffMappings } = require('../../models/staffOrgMapping.model');
const { findOrganizationById } = require('../../models/organization.model');
const { getRoleByName } = require('../../models/role.model');
const { createUser, userExists } = require('../../models/user.model');
const { generateAndSendOTP } = require('../../services/otp.service');
const { createAuditLog } = require('../../services/audit.service');
const { HTTP_STATUS, SUCCESS_MESSAGES, ERROR_MESSAGES, AUDIT_ACTIONS, OTP_PURPOSE, STAFF_STATUS } = require('../../utils/constants');
const { isValidEmail, validatePassword, validateRequiredFields } = require('../../utils/validators');
const logger = require('../../utils/logger');
const { query } = require('../../config/db');

/**
 * Onboard staff member
 * POST /api/users/staff/onboard
 */
const onboardStaff = async (req, res) => {
    try {
        const {
            email,
            phone,
            password,
            roleName,
            organizationId,
            professionalLicense,
            shiftStart,
            shiftEnd,
            firstName,
            lastName,
        } = req.body;

        // Validate required fields
        const validation = validateRequiredFields(req.body, [
            'email',
            'password',
            'roleName',
            // 'organizationId', // Optional - defaulting logic handled below
        ]);

        if (!validation.isValid) {
            return res.status(HTTP_STATUS.BAD_REQUEST).json({
                success: false,
                message: ERROR_MESSAGES.REQUIRED_FIELDS_MISSING,
                missing: validation.missing,
            });
        }

        // Validate email
        if (!isValidEmail(email)) {
            return res.status(HTTP_STATUS.BAD_REQUEST).json({
                success: false,
                message: ERROR_MESSAGES.INVALID_EMAIL,
            });
        }

        // Validate password
        const passwordValidation = validatePassword(password);
        if (!passwordValidation.isValid) {
            return res.status(HTTP_STATUS.BAD_REQUEST).json({
                success: false,
                message: ERROR_MESSAGES.WEAK_PASSWORD,
                errors: passwordValidation.errors,
            });
        }

        // Check if user already exists
        const exists = await userExists(email, phone);
        if (exists) {
            return res.status(HTTP_STATUS.CONFLICT).json({
                success: false,
                message: ERROR_MESSAGES.USER_ALREADY_EXISTS,
            });
        }

        // Handle Organization ID
        let targetOrgId = organizationId;

        if (!targetOrgId) {
            // If not provided, try to get from requester's staff mapping (for Hospital Admins)
            // We need to query staff_org_mapping for the current user
            const requesterOrg = await query(
                'SELECT organization_id FROM staff_org_mapping WHERE user_id = $1 AND status = \'active\'',
                [req.user.id]
            );

            if (requesterOrg.rows.length > 0) {
                targetOrgId = requesterOrg.rows[0].organization_id;
            } else {
                // If requester has no org (e.g. System Admin) and didn't provide one
                return res.status(HTTP_STATUS.BAD_REQUEST).json({
                    success: false,
                    message: 'Organization ID is required for this action',
                });
            }
        }

        // Verify organization exists
        const organization = await findOrganizationById(targetOrgId);
        if (!organization) {
            return res.status(HTTP_STATUS.NOT_FOUND).json({
                success: false,
                message: ERROR_MESSAGES.ORG_NOT_FOUND,
            });
        }

        // Get role
        const role = await getRoleByName(roleName);
        if (!role) {
            return res.status(HTTP_STATUS.BAD_REQUEST).json({
                success: false,
                message: 'Invalid role name',
            });
        }

        // Create user
        const user = await createUser({
            email,
            phone: phone || null,
            password,
            roleId: role.id,
            firstName: firstName || null,
            lastName: lastName || null,
        });

        // Create staff-organization mapping
        const staffMapping = await createStaffMapping({
            userId: user.id,
            organizationId: targetOrgId,
            roleId: role.id,
            professionalLicense: professionalLicense || null,
            licenseVerified: false,
            shiftStart: shiftStart || null,
            shiftEnd: shiftEnd || null,
        });

        // Generate and send OTP for verification
        await generateAndSendOTP({
            email,
            userId: user.id,
            purpose: OTP_PURPOSE.REGISTRATION,
        });

        // Audit log
        await createAuditLog({
            userId: req.user.id,
            action: AUDIT_ACTIONS.STAFF_ONBOARD,
            entityType: 'user',
            entityId: user.id,
            purpose: 'Staff onboarding',
            ipAddress: req.ip,
            userAgent: req.headers['user-agent'],
            requestMethod: req.method,
            requestPath: req.path,
            statusCode: HTTP_STATUS.CREATED,
            metadata: { organizationId: targetOrgId, roleName },
        });

        logger.info('Staff member onboarded successfully:', {
            userId: user.id,
            organizationId: targetOrgId,
            role: roleName,
        });

        res.status(HTTP_STATUS.CREATED).json({
            success: true,
            message: SUCCESS_MESSAGES.STAFF_ONBOARDED,
            data: {
                userId: user.id,
                email: user.email,
                role: roleName,
                organizationId: targetOrgId,
                staffMappingId: staffMapping.id,
            },
        });
    } catch (error) {
        logger.error('Staff onboarding failed:', error);
        res.status(HTTP_STATUS.INTERNAL_SERVER_ERROR).json({
            success: false,
            message: ERROR_MESSAGES.INTERNAL_ERROR,
            error: process.env.NODE_ENV === 'development' ? error.message : undefined,
        });
    }
};

/**
 * Deactivate staff member
 * PUT /api/users/staff/deactivate
 */
const deactivateStaff = async (req, res) => {
    try {
        const { userId, organizationId } = req.body;

        if (!userId || !organizationId) {
            return res.status(HTTP_STATUS.BAD_REQUEST).json({
                success: false,
                message: 'User ID and Organization ID are required',
            });
        }

        // Deactivate staff mapping
        const result = await deactivateStaffMapping(userId, organizationId);

        if (!result) {
            return res.status(HTTP_STATUS.NOT_FOUND).json({
                success: false,
                message: 'Staff mapping not found',
            });
        }

        // Audit log
        await createAuditLog({
            userId: req.user.id,
            action: AUDIT_ACTIONS.STAFF_DEACTIVATE,
            entityType: 'user',
            entityId: userId,
            purpose: 'Staff deactivation',
            ipAddress: req.ip,
            userAgent: req.headers['user-agent'],
            requestMethod: req.method,
            requestPath: req.path,
            statusCode: HTTP_STATUS.OK,
            metadata: { organizationId },
        });

        logger.info('Staff member deactivated:', { userId, organizationId });

        res.status(HTTP_STATUS.OK).json({
            success: true,
            message: SUCCESS_MESSAGES.STAFF_DEACTIVATED,
        });
    } catch (error) {
        logger.error('Staff deactivation failed:', error);
        res.status(HTTP_STATUS.INTERNAL_SERVER_ERROR).json({
            success: false,
            message: ERROR_MESSAGES.INTERNAL_ERROR,
        });
    }
};

/**
 * Verify staff professional license
 * PUT /api/users/staff/verify-license
 */
const verifyLicense = async (req, res) => {
    try {
        const { mappingId } = req.body;

        if (!mappingId) {
            return res.status(HTTP_STATUS.BAD_REQUEST).json({
                success: false,
                message: 'Mapping ID is required',
            });
        }

        const result = await verifyStaffLicense(mappingId);

        if (!result) {
            return res.status(HTTP_STATUS.NOT_FOUND).json({
                success: false,
                message: 'Staff mapping not found',
            });
        }

        logger.info('Staff license verified:', { mappingId });

        res.status(HTTP_STATUS.OK).json({
            success: true,
            message: 'Professional license verified successfully',
            data: result,
        });
    } catch (error) {
        logger.error('License verification failed:', error);
        res.status(HTTP_STATUS.INTERNAL_SERVER_ERROR).json({
            success: false,
            message: ERROR_MESSAGES.INTERNAL_ERROR,
        });
    }
};

/**
 * Get user profile
 * GET /api/users/profile
 */
const getUserProfile = async (req, res) => {
    try {
        const userId = req.user.id;

        const user = await findUserById(userId);

        if (!user) {
            return res.status(HTTP_STATUS.NOT_FOUND).json({
                success: false,
                message: ERROR_MESSAGES.USER_NOT_FOUND,
            });
        }

        // Get staff mappings if applicable
        const staffMappings = await getUserStaffMappings(userId);

        res.status(HTTP_STATUS.OK).json({
            success: true,
            data: {
                user: {
                    id: user.id,
                    email: user.email,
                    phone: user.phone,
                    role: user.role_name,
                    isVerified: user.is_verified,
                    status: user.status,
                    createdAt: user.created_at,
                },
                staffMappings,
            },
        });
    } catch (error) {
        logger.error('Get user profile failed:', error);
        res.status(HTTP_STATUS.INTERNAL_SERVER_ERROR).json({
            success: false,
            message: ERROR_MESSAGES.INTERNAL_ERROR,
        });
    }
};

/**
 * Get all users (admin only)
 * GET /api/users
 */
    const getUsers = async (req, res) => {
    try {
        const { limit, offset, role, status } = req.query;
        let organizationId = null;

        // If not system admin, restrict to own organization
        if (req.user.role !== 'SYSTEM_ADMIN') {
            const orgResult = await query(
                'SELECT organization_id FROM staff_org_mapping WHERE user_id = $1 AND status = \'active\'',
                [req.user.id]
            );
            
            if (orgResult.rows.length > 0) {
                organizationId = orgResult.rows[0].organization_id;
            } else {
                // If user has no organization and is not system admin, they shouldn't see any other users
                // Return empty list or error? Empty list seems safer.
                return res.status(HTTP_STATUS.OK).json({
                    success: true,
                    data: [],
                });
            }
        }

        const result = await getAllUsers({
            limit: parseInt(limit) || 50,
            offset: parseInt(offset) || 0,
            role,
            status,
            organizationId
        });

        // Map users to match frontend expectations
        const mappedUsers = result.map(user => ({
            ...user,
            role: user.role_name,
            is_active: user.status === 'active'
        }));

        res.status(HTTP_STATUS.OK).json({
            success: true,
            data: mappedUsers,
        });
    } catch (error) {
        logger.error('Get users failed:', error);
        res.status(HTTP_STATUS.INTERNAL_SERVER_ERROR).json({
            success: false,
            message: ERROR_MESSAGES.INTERNAL_ERROR,
        });
    }
};

/**
 * Get all doctors (for consent management)
 * GET /api/users/doctors
 */
const getDoctors = async (req, res) => {
    try {
        const { limit, offset } = req.query;

        const doctorsQuery = `
      SELECT u.id, u.email, u.phone, u.created_at,
             u.first_name as "firstName",
             u.last_name as "lastName",
             'General Practice' as specialization,
             som.professional_license, som.organization_id, o.name as organization_name
      FROM users u
      INNER JOIN roles r ON u.role_id = r.id
      LEFT JOIN staff_org_mapping som ON u.id = som.user_id AND som.status = 'active'
      LEFT JOIN organizations o ON som.organization_id = o.id
      WHERE r.name = 'doctor' AND u.status = 'active' AND u.is_verified = true
      ORDER BY u.created_at DESC
      LIMIT $1 OFFSET $2
    `;

        const result = await query(doctorsQuery, [
            parseInt(limit) || 50,
            parseInt(offset) || 0,
        ]);

        res.status(HTTP_STATUS.OK).json({
            success: true,
            data: result.rows,
        });
    } catch (error) {
        logger.error('Get doctors failed:', error);
        res.status(HTTP_STATUS.INTERNAL_SERVER_ERROR).json({
            success: false,
            message: ERROR_MESSAGES.INTERNAL_ERROR,
        });
    }
};

/**
 * Get all nurses (for visit management)
 * GET /api/users/nurses
 */
const getNurses = async (req, res) => {
    try {
        const { limit, offset } = req.query;

        const nursesQuery = `
      SELECT u.id, u.email, u.phone, u.created_at,
             u.first_name as "firstName",
             u.last_name as "lastName",
             som.professional_license, som.organization_id, o.name as organization_name
      FROM users u
      INNER JOIN roles r ON u.role_id = r.id
      LEFT JOIN staff_org_mapping som ON u.id = som.user_id AND som.status = 'active'
      LEFT JOIN organizations o ON som.organization_id = o.id
      WHERE r.name = 'nurse' AND u.status = 'active' AND u.is_verified = true
      ORDER BY u.created_at DESC
      LIMIT $1 OFFSET $2
    `;

        const result = await query(nursesQuery, [
            parseInt(limit) || 50,
            parseInt(offset) || 0,
        ]);

        res.status(HTTP_STATUS.OK).json({
            success: true,
            data: result.rows,
        });
    } catch (error) {
        logger.error('Get nurses failed:', error);
        res.status(HTTP_STATUS.INTERNAL_SERVER_ERROR).json({
            success: false,
            message: ERROR_MESSAGES.INTERNAL_ERROR,
        });
    }
};

module.exports = {
    onboardStaff,
    deactivateStaff,
    verifyLicense,
    getUserProfile,
    getUsers,
    getDoctors,
    getNurses,
};
