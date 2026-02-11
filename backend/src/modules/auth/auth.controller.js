const { createUser, findUserByEmailOrPhone, userExists, updateUserVerification, updateLastLogin, incrementFailedLoginAttempts, isAccountLocked } = require('../../models/user.model');
const { createPatientProfile, findPatientByUserId } = require('../../models/patient.model');
const { createOrganization } = require('../../models/organization.model');
const { getRoleByName } = require('../../models/role.model');
const { generateAndSendOTP, verifyOTP } = require('../../services/otp.service');
const { comparePassword, hashGovtId } = require('../../services/encryption.service');
const { generateAccessToken, generateRefreshToken } = require('../../config/jwt');
const { hashToken } = require('../../services/encryption.service');
const { createAuditLog } = require('../../services/audit.service');
const { captureDeviceInfo } = require('../../services/device.service');
const { query, transaction } = require('../../config/db');
const { HTTP_STATUS, SUCCESS_MESSAGES, ERROR_MESSAGES, ROLES, OTP_PURPOSE, AUDIT_ACTIONS } = require('../../utils/constants');
const { isValidEmail, isValidPhone, validatePassword, validateRequiredFields } = require('../../utils/validators');
const logger = require('../../utils/logger');
const config = require('../../config/env');

/**
 * Register patient
 * POST /api/auth/register/patient
 */
const registerPatient = async (req, res) => {
    try {
        const { email, phone, password, govtId, dateOfBirth, firstName, lastName } = req.body;

        // Validate required fields
        const validation = validateRequiredFields(req.body, ['password']);
        if (!validation.isValid) {
            return res.status(HTTP_STATUS.BAD_REQUEST).json({
                success: false,
                message: ERROR_MESSAGES.REQUIRED_FIELDS_MISSING,
                missing: validation.missing,
            });
        }

        // Validate email or phone
        if (!email && !phone) {
            return res.status(HTTP_STATUS.BAD_REQUEST).json({
                success: false,
                message: 'Either email or phone is required',
            });
        }

        if (email && !isValidEmail(email)) {
            return res.status(HTTP_STATUS.BAD_REQUEST).json({
                success: false,
                message: ERROR_MESSAGES.INVALID_EMAIL,
            });
        }

        if (phone && !isValidPhone(phone)) {
            return res.status(HTTP_STATUS.BAD_REQUEST).json({
                success: false,
                message: ERROR_MESSAGES.INVALID_PHONE,
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

        // Check if government ID already exists
        if (govtId) {
            const govtIdHash = hashGovtId(govtId);
            const govtIdCheckQuery = 'SELECT id FROM patient_profiles WHERE govt_id_hash = $1';
            const govtIdResult = await query(govtIdCheckQuery, [govtIdHash]);

            if (govtIdResult.rows.length > 0) {
                return res.status(HTTP_STATUS.CONFLICT).json({
                    success: false,
                    message: 'Patient with this Government ID already exists',
                });
            }
        }

        // Get patient role
        const patientRole = await getRoleByName(ROLES.PATIENT);
        if (!patientRole) {
            throw new Error('Patient role not found in database');
        }

        // Create user and patient profile in transaction
        const result = await transaction(async (client) => {
            // Create user
            const userQuery = `
        INSERT INTO users (email, phone, password_hash, role_id, first_name, last_name, status)
        VALUES ($1, $2, crypt($3, gen_salt('bf', 12)), $4, $5, $6, 'pending')
        RETURNING id, email, phone, role_id, status, created_at
      `;

            const userResult = await client.query(userQuery, [
                email || null,
                phone || null,
                password,
                patientRole.id,
                firstName || null,
                lastName || null,
            ]);

            const user = userResult.rows[0];

            // Create patient profile
            const profile = await createPatientProfile({
                userId: user.id,
                govtId: govtId || null,
                dateOfBirth: dateOfBirth || null,
            }, client);

            return { user, profile };
        });

        // Generate and send OTP
        await generateAndSendOTP({
            email: email || null,
            phone: phone || null,
            userId: result.user.id,
            purpose: OTP_PURPOSE.REGISTRATION,
        });

        // Audit log
        await createAuditLog({
            userId: result.user.id,
            action: AUDIT_ACTIONS.USER_REGISTER,
            entityType: 'user',
            entityId: result.user.id,
            purpose: 'Patient registration',
            ipAddress: req.ip,
            userAgent: req.headers['user-agent'],
            requestMethod: req.method,
            requestPath: req.path,
            statusCode: HTTP_STATUS.CREATED,
        });

        logger.info('Patient registered successfully:', { userId: result.user.id, email, phone });

        res.status(HTTP_STATUS.CREATED).json({
            success: true,
            message: SUCCESS_MESSAGES.USER_REGISTERED + '. Please verify your OTP.',
            data: {
                userId: result.user.id,
                uniqueHealthId: result.profile.unique_health_id,
                email: result.user.email,
                phone: result.user.phone,
            },
        });
    } catch (error) {
        logger.error('Patient registration failed:', error);
        res.status(HTTP_STATUS.INTERNAL_SERVER_ERROR).json({
            success: false,
            message: ERROR_MESSAGES.INTERNAL_ERROR,
            error: process.env.NODE_ENV === 'development' ? error.message : undefined,
        });
    }
};

/**
 * Register organization (hospital/clinic/pharmacy)
 * POST /api/auth/register/organization
 */
const registerOrganization = async (req, res) => {
    try {
        const {
            // Admin user details
            email,
            phone,
            password,
            // Organization details
            organizationName,
            organizationType,
            licenseNumber,
            address,
            city,
            state,
            country,
            postalCode,
            organizationPhone,
            organizationEmail,
        } = req.body;

        // Validate required fields
        const validation = validateRequiredFields(req.body, [
            'email',
            'password',
            'organizationName',
            'organizationType',
            'licenseNumber',
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

        // Get hospital admin role
        const adminRole = await getRoleByName(ROLES.HOSPITAL_ADMIN);
        if (!adminRole) {
            throw new Error('Hospital admin role not found in database');
        }

        // Create user and organization in transaction
        const result = await transaction(async (client) => {
            // Create admin user
            const userQuery = `
        INSERT INTO users (email, phone, password_hash, role_id, status, is_verified)
        VALUES ($1, $2, crypt($3, gen_salt('bf', 12)), $4, 'pending', false)
        RETURNING id, email, phone, role_id, status, created_at
      `;

            const userResult = await client.query(userQuery, [
                email,
                phone || null,
                password,
                adminRole.id,
            ]);

            const user = userResult.rows[0];

            // Create organization
            const orgQuery = `
        INSERT INTO organizations (
          name, type, license_number, address, city, state, country,
          postal_code, phone, email, admin_user_id, status
        ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, 'pending')
        RETURNING *
      `;

            const orgResult = await client.query(orgQuery, [
                organizationName,
                organizationType,
                licenseNumber,
                address || null,
                city || null,
                state || null,
                country || null,
                postalCode || null,
                organizationPhone || null,
                organizationEmail || null,
                user.id,
            ]);

            return { user, organization: orgResult.rows[0] };
        });

        // Generate and send OTP
        await generateAndSendOTP({
            email,
            userId: result.user.id,
            purpose: OTP_PURPOSE.REGISTRATION,
        });

        // Audit log
        await createAuditLog({
            userId: result.user.id,
            action: AUDIT_ACTIONS.ORG_REGISTER,
            entityType: 'organization',
            entityId: result.organization.id,
            purpose: 'Organization registration',
            ipAddress: req.ip,
            userAgent: req.headers['user-agent'],
            requestMethod: req.method,
            requestPath: req.path,
            statusCode: HTTP_STATUS.CREATED,
        });

        logger.info('Organization registered successfully:', {
            userId: result.user.id,
            organizationId: result.organization.id,
            organizationType,
        });

        res.status(HTTP_STATUS.CREATED).json({
            success: true,
            message: 'Organization registered successfully. Please verify your OTP to activate.',
            data: {
                userId: result.user.id,
                organizationId: result.organization.id,
                organizationName: result.organization.name,
                email: result.user.email,
            },
        });
    } catch (error) {
        logger.error('Organization registration failed:', error);

        if (error.message.includes('already exists')) {
            return res.status(HTTP_STATUS.CONFLICT).json({
                success: false,
                message: error.message,
            });
        }

        res.status(HTTP_STATUS.INTERNAL_SERVER_ERROR).json({
            success: false,
            message: ERROR_MESSAGES.INTERNAL_ERROR,
            error: process.env.NODE_ENV === 'development' ? error.message : undefined,
        });
    }
};

/**
 * Verify OTP
 * POST /api/auth/verify-otp
 */
const verifyOTPController = async (req, res) => {
    try {
        // If purpose is not provided, default to 'registration'
        if (!req.body.purpose) {
            req.body.purpose = OTP_PURPOSE.REGISTRATION;
        }

        const { email, phone, otp, purpose } = req.body;

        // Validate required fields
        if (!otp || !purpose) {
            return res.status(HTTP_STATUS.BAD_REQUEST).json({
                success: false,
                message: 'OTP and purpose are required',
            });
        }

        if (!email && !phone) {
            return res.status(HTTP_STATUS.BAD_REQUEST).json({
                success: false,
                message: 'Either email or phone is required',
            });
        }

        // Verify OTP
        const result = await verifyOTP({ email, phone, otp, purpose });

        if (!result.success) {
            return res.status(HTTP_STATUS.BAD_REQUEST).json(result);
        }

        // Update user verification status
        if (result.userId) {
            await updateUserVerification(result.userId, true);
        }

        // Audit log
        await createAuditLog({
            userId: result.userId,
            action: AUDIT_ACTIONS.OTP_VERIFY,
            purpose: `OTP verification for ${purpose}`,
            ipAddress: req.ip,
            userAgent: req.headers['user-agent'],
            requestMethod: req.method,
            requestPath: req.path,
            statusCode: HTTP_STATUS.OK,
        });

        logger.info('OTP verified successfully:', { userId: result.userId, purpose });

        res.status(HTTP_STATUS.OK).json({
            success: true,
            message: SUCCESS_MESSAGES.OTP_VERIFIED,
            data: {
                userId: result.userId,
            },
        });
    } catch (error) {
        logger.error('OTP verification failed:', error);
        res.status(HTTP_STATUS.BAD_REQUEST).json({
            success: false,
            message: error.message || ERROR_MESSAGES.INVALID_OTP,
        });
    }
};

/**
 * Login
 * POST /api/auth/login
 */
const login = async (req, res) => {
    try {
        // If frontend sends 'email', convert to 'emailOrPhone'
        if (req.body.email && !req.body.emailOrPhone) {
            req.body.emailOrPhone = req.body.email;
        }

        const { emailOrPhone, password } = req.body;

        // Validate required fields
        if (!emailOrPhone || !password) {
            return res.status(HTTP_STATUS.BAD_REQUEST).json({
                success: false,
                message: 'Email/phone and password are required',
            });
        }

        // Find user
        const user = await findUserByEmailOrPhone(emailOrPhone);

        if (!user) {
            return res.status(HTTP_STATUS.UNAUTHORIZED).json({
                success: false,
                message: ERROR_MESSAGES.INVALID_CREDENTIALS,
            });
        }

        // Check if account is locked
        const locked = await isAccountLocked(user.id);
        if (locked) {
            return res.status(HTTP_STATUS.FORBIDDEN).json({
                success: false,
                message: ERROR_MESSAGES.ACCOUNT_LOCKED,
            });
        }

        // Verify password
        const isValidPassword = await comparePassword(password, user.password_hash);

        if (!isValidPassword) {
            // Increment failed attempts
            await incrementFailedLoginAttempts(user.id);

            // Audit log
            await createAuditLog({
                userId: user.id,
                action: 'failed_login',
                purpose: 'Invalid password',
                ipAddress: req.ip,
                userAgent: req.headers['user-agent'],
                requestMethod: req.method,
                requestPath: req.path,
                statusCode: HTTP_STATUS.UNAUTHORIZED,
            });

            return res.status(HTTP_STATUS.UNAUTHORIZED).json({
                success: false,
                message: ERROR_MESSAGES.INVALID_CREDENTIALS,
            });
        }

        // Check if user is verified
        if (!user.is_verified) {
            return res.status(HTTP_STATUS.FORBIDDEN).json({
                success: false,
                message: ERROR_MESSAGES.ACCOUNT_NOT_VERIFIED,
            });
        }

        // Fetch additional role-specific data
        let uniqueHealthId = null;
        if (user.role_name === ROLES.PATIENT) {
            const patientProfile = await findPatientByUserId(user.id);
            if (patientProfile) {
                uniqueHealthId = patientProfile.unique_health_id;
            }
        }

        // Generate tokens
        const tokenPayload = {
            userId: user.id,
            email: user.email,
            phone: user.phone,
            roleId: user.role_id,
            roleName: user.role_name,
            firstName: user.first_name,
            lastName: user.last_name,
            uniqueHealthId,
        };

        const accessToken = generateAccessToken(tokenPayload);
        const refreshToken = generateRefreshToken(tokenPayload);

        // Store session with device information
        const tokenHash = hashToken(accessToken);
        const refreshTokenHash = hashToken(refreshToken);
        const deviceInfo = captureDeviceInfo(req);

        const sessionQuery = `
      INSERT INTO sessions (
        user_id, token_hash, refresh_token_hash, ip_address, user_agent,
        device_info, expires_at
      ) VALUES ($1, $2, $3, $4, $5, $6, NOW() + INTERVAL '${config.jwt.expiresIn}')
      RETURNING id
    `;

        await query(sessionQuery, [
            user.id,
            tokenHash,
            refreshTokenHash,
            req.ip,
            req.headers['user-agent'],
            JSON.stringify(deviceInfo),
        ]);

        // Update last login
        await updateLastLogin(user.id);

        // Audit log
        await createAuditLog({
            userId: user.id,
            action: AUDIT_ACTIONS.USER_LOGIN,
            purpose: 'User login',
            ipAddress: req.ip,
            userAgent: req.headers['user-agent'],
            requestMethod: req.method,
            requestPath: req.path,
            statusCode: HTTP_STATUS.OK,
        });

        logger.info('User logged in successfully:', { userId: user.id, role: user.role_name });

        res.status(HTTP_STATUS.OK).json({
            success: true,
            message: SUCCESS_MESSAGES.LOGIN_SUCCESS,
            data: {
                user: {
                    id: user.id,
                    email: user.email,
                    phone: user.phone,
                    role: user.role_name,
                    firstName: user.first_name,
                    lastName: user.last_name,
                    uniqueHealthId,
                },
                accessToken,
                refreshToken,
            },
        });
    } catch (error) {
        logger.error('Login failed:', error);
        res.status(HTTP_STATUS.INTERNAL_SERVER_ERROR).json({
            success: false,
            message: ERROR_MESSAGES.INTERNAL_ERROR,
            error: process.env.NODE_ENV === 'development' ? error.message : undefined,
        });
    }
};

/**
 * Logout
 * POST /api/auth/logout
 */
const logout = async (req, res) => {
    try {
        const userId = req.user.id;

        // Deactivate all active sessions for user
        await query('UPDATE sessions SET is_active = false WHERE user_id = $1', [userId]);

        // Audit log
        await createAuditLog({
            userId,
            action: AUDIT_ACTIONS.USER_LOGOUT,
            purpose: 'User logout',
            ipAddress: req.ip,
            userAgent: req.headers['user-agent'],
            requestMethod: req.method,
            requestPath: req.path,
            statusCode: HTTP_STATUS.OK,
        });

        logger.info('User logged out successfully:', { userId });

        res.status(HTTP_STATUS.OK).json({
            success: true,
            message: SUCCESS_MESSAGES.LOGOUT_SUCCESS,
        });
    } catch (error) {
        logger.error('Logout failed:', error);
        res.status(HTTP_STATUS.INTERNAL_SERVER_ERROR).json({
            success: false,
            message: ERROR_MESSAGES.INTERNAL_ERROR,
        });
    }
};

/**
 * Resend OTP
 * POST /api/auth/resend-otp
 */
const resendOTP = async (req, res) => {
    try {
        const { email, phone, purpose } = req.body;

        if (!email && !phone) {
            return res.status(HTTP_STATUS.BAD_REQUEST).json({
                success: false,
                message: 'Either email or phone is required',
            });
        }

        // Generate and send OTP
        const result = await generateAndSendOTP({
            email: email || null,
            phone: phone || null,
            purpose: purpose || OTP_PURPOSE.REGISTRATION,
        });

        res.status(HTTP_STATUS.OK).json({
            success: true,
            message: SUCCESS_MESSAGES.OTP_SENT,
            data: result,
        });
    } catch (error) {
        logger.error('Resend OTP failed:', error);
        res.status(HTTP_STATUS.BAD_REQUEST).json({
            success: false,
            message: error.message || 'Failed to send OTP',
        });
    }
};

/**
 * Register Doctor
 * POST /api/auth/register/doctor
 */
const registerDoctor = async (req, res) => {
    try {
        const { email, phone, password, firstName, lastName } = req.body;

        // Validate required fields
        const validation = validateRequiredFields(req.body, ['email', 'password']);
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

        // Get doctor role
        const doctorRole = await getRoleByName(ROLES.DOCTOR);
        if (!doctorRole) {
            throw new Error('Doctor role not found in database');
        }

        // Create user
        const user = await createUser({
            email,
            phone: phone || null,
            password,
            roleId: doctorRole.id,
            firstName,
            lastName,
        });

        // Generate and send OTP
        await generateAndSendOTP({
            email,
            userId: user.id,
            purpose: OTP_PURPOSE.REGISTRATION,
        });

        // Audit log
        await createAuditLog({
            userId: user.id,
            action: AUDIT_ACTIONS.USER_REGISTER,
            entityType: 'user',
            entityId: user.id,
            purpose: 'Doctor registration',
            ipAddress: req.ip,
            userAgent: req.headers['user-agent'],
            requestMethod: req.method,
            requestPath: req.path,
            statusCode: HTTP_STATUS.CREATED,
        });

        logger.info('Doctor registered successfully:', { userId: user.id, email });

        res.status(HTTP_STATUS.CREATED).json({
            success: true,
            message: SUCCESS_MESSAGES.USER_REGISTERED + '. Please verify your OTP.',
            data: {
                userId: user.id,
                email: user.email,
                phone: user.phone,
            },
        });
    } catch (error) {
        logger.error('Doctor registration failed:', error);
        res.status(HTTP_STATUS.INTERNAL_SERVER_ERROR).json({
            success: false,
            message: ERROR_MESSAGES.INTERNAL_ERROR,
            error: process.env.NODE_ENV === 'development' ? error.message : undefined,
        });
    }
};

module.exports = {
    registerPatient,
    registerOrganization,
    registerDoctor,
    verifyOTPController,
    login,
    logout,
    resendOTP,
};

