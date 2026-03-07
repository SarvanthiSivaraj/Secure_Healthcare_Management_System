const pool = require('../config/db');

class VisitModel {
    /**
     * Create a new visit
     * @param {Object} visitData 
     * @returns {Promise<Object>} Created visit
     */
    static async create(visitData) {
        const {
            patientId,
            organizationId,
            reason,
            symptoms,
            type,
            priority,
            doctorId
        } = visitData;

        // Generate a random 8-character alphanumeric visit code
        const visitCode = 'V-' + Math.random().toString(36).substring(2, 8).toUpperCase() + Math.floor(Math.random() * 10);

        const query = `
            INSERT INTO visits (
                patient_id, organization_id, reason, symptoms, type, priority, status, assigned_doctor_id, visit_code
            )
            VALUES ($1, $2, $3, $4, $5, $6, 'pending', $7, $8)
            RETURNING *
        `;

        const values = [
            patientId,
            organizationId,
            reason || null,
            symptoms || null,
            type || 'walk_in',
            priority || 'normal',
            doctorId || null,
            visitCode
        ];
        const result = await pool.query(query, values);
        return result.rows[0];
    }

    /**
     * Get visit by ID
     * @param {string} visitId 
     * @returns {Promise<Object>}
     */
    static async findById(visitId) {
        const query = `
            SELECT v.*, 
                   u.first_name as patient_first_name, 
                   u.last_name as patient_last_name,
                   u.email as patient_email,
                   p.date_of_birth,
                   p.gender
            FROM visits v
            JOIN users u ON v.patient_id = u.id
            LEFT JOIN patient_profiles p ON u.id = p.user_id
            WHERE v.id = $1
        `;
        const result = await pool.query(query, [visitId]);
        return result.rows[0];
    }

    /**
     * Get visits for an organization
     * @param {string} organizationId 
     * @param {Object} filters { status, limit, offset }
     * @returns {Promise<Array>}
     */
    static async findByOrganization(organizationId, filters = {}) {
        const { status, limit = 50, offset = 0 } = filters;

        let query = `
            SELECT v.*, 
                   u.first_name as patient_first_name, 
                   u.last_name as patient_last_name,
                   d.first_name as doctor_first_name,
                   d.last_name as doctor_last_name
            FROM visits v
            JOIN users u ON v.patient_id = u.id
            LEFT JOIN users d ON v.assigned_doctor_id = d.id
            WHERE v.organization_id = $1
        `;

        const values = [organizationId];

        if (status) {
            query += ` AND v.status = $${values.length + 1}`;
            values.push(status);
        }

        query += ` ORDER BY v.created_at DESC LIMIT $${values.length + 1} OFFSET $${values.length + 2}`;
        values.push(limit, offset);

        const result = await pool.query(query, values);
        return result.rows;
    }

    /**
     * Get active visit for a patient (to prevent duplicates)
     * @param {string} patientId 
     * @returns {Promise<Object>}
     */
    static async findActiveByPatient(patientId) {
        const query = `
            SELECT * FROM visits 
            WHERE patient_id = $1 
            AND status IN ('pending', 'approved', 'in_progress')
            LIMIT 1
        `;
        const result = await pool.query(query, [patientId]);
        return result.rows[0];
    }

    /**
     * Update visit status and assignments
     * @param {string} visitId 
     * @param {Object} updateData 
     * @returns {Promise<Object>}
     */
    static async update(visitId, updateData) {
        const { status, assignedDoctorId, assignedNurseId, otpVerified, accessLevel, scheduledTime } = updateData;

        // Build dynamic query
        const updates = [];
        const values = [];
        let paramCount = 1;

        if (status) {
            updates.push(`status = $${paramCount++}`);
            values.push(status);

            if (status === 'completed' || status === 'cancelled') {
                updates.push(`check_out_time = CURRENT_TIMESTAMP`);
            }
        }

        if (assignedDoctorId !== undefined) {
            updates.push(`assigned_doctor_id = $${paramCount++}`);
            values.push(assignedDoctorId);
        }

        if (assignedNurseId !== undefined) {
            updates.push(`assigned_nurse_id = $${paramCount++}`);
            values.push(assignedNurseId);
        }

        if (otpVerified !== undefined) {
            updates.push(`otp_verified = $${paramCount++}`);
            values.push(otpVerified);
        }

        if (accessLevel) {
            updates.push(`access_level = $${paramCount++}`);
            values.push(accessLevel);
        }

        if (scheduledTime !== undefined) {
            updates.push(`scheduled_time = $${paramCount++}`);
            values.push(scheduledTime);
        }

        if (updates.length === 0) return null;

        values.push(visitId);
        const query = `
            UPDATE visits 
            SET ${updates.join(', ')}, updated_at = CURRENT_TIMESTAMP
            WHERE id = $${paramCount}
            RETURNING *
        `;

        const result = await pool.query(query, values);
        return result.rows[0];
    }

    /**
     * Approve visit and generate OTP
     * @param {string} visitId 
     * @param {string} doctorId 
     * @param {string} nurseId 
     * @returns {Promise<Object>} Visit with OTP
     */
    static async approveVisit(visitId, doctorId, nurseId) {
        // Generate 6-digit OTP (this will be the visit code for check-in)
        const otp = Math.floor(100000 + Math.random() * 900000).toString();
        const otpExpiresAt = new Date(Date.now() + 24 * 60 * 60 * 1000); // 24 hours from now

        const query = `
            UPDATE visits 
            SET 
                status = 'approved',
                assigned_doctor_id = $1,
                assigned_nurse_id = $2,
                otp_code = $3,
                otp_expires_at = $4,
                updated_at = CURRENT_TIMESTAMP
            WHERE id = $5
            RETURNING *
        `;

        const result = await pool.query(query, [doctorId, nurseId, otp, otpExpiresAt, visitId]);
        const visit = result.rows[0];

        // Auto-grant consent to Doctor if approved
        if (visit && doctorId) {
            await pool.query(`
                INSERT INTO consents (
                    patient_id, recipient_user_id, data_category, purpose, access_level, status, start_time, created_at, updated_at
                ) VALUES ($1, $2, 'all_medical_data', 'Visit Care', 'write', 'active', NOW(), NOW(), NOW())
            `, [visit.patient_id, doctorId]);
        }

        // Auto-grant consent to Nurse if assigned
        if (visit && nurseId) {
            await pool.query(`
                INSERT INTO consents (
                    patient_id, recipient_user_id, data_category, purpose, access_level, status, start_time, created_at, updated_at
                ) VALUES ($1, $2, 'all_medical_data', 'Visit Care', 'write', 'active', NOW(), NOW(), NOW())
            `, [visit.patient_id, nurseId]);
        }

        return visit;
    }

    /**
     * Verify OTP and set access level
     * @param {string} visitId 
     * @param {string} otp 
     * @param {string} accessLevel - 'read' or 'write'
     * @returns {Promise<Object>} Updated visit
     */
    static async verifyOTP(visitId, otp, accessLevel) {
        // Check if OTP is valid
        const checkQuery = `
            SELECT * FROM visits 
            WHERE id = $1 
            AND otp_code = $2 
            AND otp_expires_at > CURRENT_TIMESTAMP
            AND otp_verified = FALSE
        `;

        const checkResult = await pool.query(checkQuery, [visitId, otp]);

        if (checkResult.rows.length === 0) {
            throw new Error('Invalid or expired OTP');
        }

        // Update visit with verified OTP and access level
        const updateQuery = `
            UPDATE visits 
            SET 
                otp_verified = TRUE,
                access_level = $1,
                status = 'in_progress',
                updated_at = CURRENT_TIMESTAMP
            WHERE id = $2
            RETURNING *
        `;

        const result = await pool.query(updateQuery, [accessLevel, visitId]);
        return result.rows[0];
    }

    /**
     * Generate access code (OTP) for patient
     * @param {string} visitId
     * @returns {Promise<Object>} Updated visit with OTP
     */
    static async generateAccessCode(visitId) {
        // Generate 6-digit OTP
        const otp = Math.floor(100000 + Math.random() * 900000).toString();
        // Set expiration to 15 minutes
        const otpExpiresAt = new Date(Date.now() + 15 * 60 * 1000);

        const query = `
            UPDATE visits
            SET
                otp_code = $1,
                otp_expires_at = $2,
                updated_at = CURRENT_TIMESTAMP
            WHERE id = $3
            RETURNING otp_code, otp_expires_at
        `;

        const result = await pool.query(query, [otp, otpExpiresAt, visitId]);
        return result.rows[0];
    }

    /**
     * Get visit with full details including patient and doctor info
     * @param {string} visitId 
     * @returns {Promise<Object>}
     */
    static async getFullDetails(visitId) {
        const query = `
            SELECT 
                v.*,
                u.first_name as patient_first_name,
                u.last_name as patient_last_name,
                u.email as patient_email,
                p.unique_health_id,
                d.first_name as doctor_first_name,
                d.last_name as doctor_last_name,
                o.name as organization_name
            FROM visits v
            JOIN users u ON v.patient_id = u.id
            LEFT JOIN patient_profiles p ON u.id = p.user_id
            LEFT JOIN users d ON v.assigned_doctor_id = d.id
            LEFT JOIN organizations o ON v.organization_id = o.id
            WHERE v.id = $1
        `;

        const result = await pool.query(query, [visitId]);
        return result.rows[0];
    }
    /**
     * Find visit by visit code
     * @param {string} visitCode 
     * @returns {Promise<Object>}
     */
    static async findByCode(visitCode) {
        const query = `
            SELECT v.*, 
                   u.first_name as patient_first_name, 
                   u.last_name as patient_last_name,
                   u.email as patient_email,
                   o.name as hospital_name
            FROM visits v
            JOIN users u ON v.patient_id = u.id
            JOIN organizations o ON v.organization_id = o.id
            WHERE v.otp_code = $1
        `;
        const result = await pool.query(query, [visitCode]);
        return result.rows[0];
    }

    /**
     * Update visit status with validation
     * @param {string} visitId 
     * @param {string} newStatus 
     * @param {string} userId - User making the change
     * @returns {Promise<Object>}
     */
    static async updateStatus(visitId, newStatus, userId) {
        const validStatuses = ['pending', 'approved', 'checked_in', 'in_progress', 'completed', 'cancelled'];

        if (!validStatuses.includes(newStatus)) {
            throw new Error(`Invalid status: ${newStatus}`);
        }

        const query = `
            UPDATE visits
            SET status = $1, updated_at = CURRENT_TIMESTAMP
            WHERE id = $2
            RETURNING *
        `;

        const result = await pool.query(query, [newStatus, visitId]);
        return result.rows[0];
    }

    /**
     * Find visits by patient ID
     * @param {string} patientId 
     * @returns {Promise<Array>}
     */
    static async findByPatientId(patientId) {
        const query = `
            SELECT v.*,
            u.first_name as doctor_first_name,
            u.last_name as doctor_last_name,
            dp.specialization as specialization,
            o.name as hospital_name
            FROM visits v
            LEFT JOIN users u ON v.assigned_doctor_id = u.id
            LEFT JOIN doctor_profiles dp ON v.assigned_doctor_id = dp.user_id
            LEFT JOIN organizations o ON v.organization_id = o.id
            WHERE v.patient_id = $1
            ORDER BY v.created_at DESC
            `;
        const result = await pool.query(query, [patientId]);
        return result.rows;
    }

    /**
     * Find visits assigned to a staff member
     * @param {string} staffId 
     * @param {string} role - 'doctor' or 'nurse'
     * @returns {Promise<Array>}
     */
    static async findByAssignedStaff(staffId, role) {
        let roleColumn = '';
        if (role === 'doctor') {
            roleColumn = 'assigned_doctor_id';
        } else if (role === 'nurse') {
            roleColumn = 'assigned_nurse_id';
        } else {
            throw new Error('Invalid role for visit assignment');
        }

        const query = `
            SELECT v.*,
            p.first_name as patient_first_name,
            p.last_name as patient_last_name,
            pp.date_of_birth,
            pp.gender
            FROM visits v
            LEFT JOIN users p ON v.patient_id = p.id
            LEFT JOIN patient_profiles pp ON v.patient_id = pp.user_id
            WHERE v.${roleColumn} = $1
            AND v.status IN ('pending', 'approved', 'checked_in', 'in_progress')
            ORDER BY v.status DESC, v.created_at ASC
            `;
        const result = await pool.query(query, [staffId]);
        return result.rows;
    }

    /**
     * Close visit (complete or cancel)
     * @param {string} visitId 
     * @param {string} userId - User closing the visit
     * @param {string} status - 'completed' or 'cancelled'
     * @returns {Promise<Object>} Updated visit
     */
    static async closeVisit(visitId, userId, status) {
        const query = `
            UPDATE visits 
            SET 
                status = $1,
                check_out_time = CURRENT_TIMESTAMP,
                updated_at = CURRENT_TIMESTAMP
            WHERE id = $2
            RETURNING *
        `;

        const result = await pool.query(query, [status, visitId]);

        return result.rows[0];
    }

    /**
     * Get all staff assigned to a visit
     * @param {string} visitId 
     * @returns {Promise<Array>}
     */
    static async getAssignedStaff(visitId) {
        const query = `
        SELECT
        vsa.id,
            vsa.role,
            vsa.access_level,
            vsa.assigned_at,
            vsa.revoked_at,
            u.id as user_id,
            u.first_name,
            u.last_name,
            u.email,
            u.role as user_role
            FROM visit_staff_assignments vsa
            JOIN users u ON vsa.staff_user_id = u.id
            WHERE vsa.visit_id = $1
            ORDER BY vsa.assigned_at DESC
            `;

        const result = await pool.query(query, [visitId]);
        return result.rows;
    }

    /**
     * Get the queue position for a specific visit belonging to a doctor
     * @param {string} visitId 
     * @param {string} doctorId 
     * @returns {Promise<Object>} Object containing queue position and ETA
     */
    static async getQueuePosition(visitId, doctorId) {
        try {
            // First get the visit's creation time
            const visitResult = await pool.query(
                'SELECT created_at, status FROM visits WHERE id = $1 AND assigned_doctor_id = $2',
                [visitId, doctorId]
            );

            if (visitResult.rows.length === 0) {
                return null;
            }

            const visit = visitResult.rows[0];

            if (['completed', 'cancelled', 'closed'].includes(visit.status)) {
                return { position: 0, total: 0, status: visit.status };
            }

            // Count how many active/pending visits the doctor has that were created BEFORE this visit
            // These patients are "ahead" in the queue
            const aheadResult = await pool.query(`
                SELECT COUNT(*) as count 
                FROM visits 
                WHERE assigned_doctor_id = $1 
                AND status IN ('pending', 'approved', 'checked_in', 'in_progress')
                AND created_at <= $2
            `, [doctorId, visit.created_at]);

            // Count total active/pending visits for the doctor to give "X of Y"
            const totalResult = await pool.query(`
                SELECT COUNT(*) as count 
                FROM visits 
                WHERE assigned_doctor_id = $1 
                AND status IN ('pending', 'approved', 'checked_in', 'in_progress')
            `, [doctorId]);

            const position = parseInt(aheadResult.rows[0].count, 10);
            const total = parseInt(totalResult.rows[0].count, 10);

            return {
                position,
                total,
                status: visit.status,
                // Simple ETA: 15 mins per patient ahead
                eta_minutes: (position - 1) * 15
            };
        } catch (error) {
            // Assuming 'logger' is defined elsewhere or will be handled by a global error handler
            // If not, this would cause a ReferenceError.
            // For this task, I'm inserting the code as provided.
            console.error('Error calculating queue position:', error); // Changed logger.error to console.error for standalone execution
            throw error;
        }
    }

    /**
     * Assign staff to a visit
     * @param {string} visitId 
     * @param {string} staffUserId 
     * @param {string} role - 'doctor', 'nurse', 'specialist', etc.
     * @returns {Promise<Object>}
     */
    static async assignStaff(visitId, staffUserId, role) {
        const query = `
            INSERT INTO visit_staff_assignments(visit_id, staff_user_id, role, access_level)
        VALUES($1, $2, $3, 'full')
            ON CONFLICT(visit_id, staff_user_id) 
            DO UPDATE SET
        role = EXCLUDED.role,
            access_level = 'full',
            revoked_at = NULL
        RETURNING *
            `;

        const result = await pool.query(query, [visitId, staffUserId, role]);
        return result.rows[0];
    }

    /**
     * Revoke staff access to a visit
     * @param {string} visitId 
     * @param {string} staffUserId - Optional, if not provided revokes all staff
     * @param {string} revokedBy - User ID revoking access
     * @returns {Promise<number>} Number of records updated
     */
    static async revokeStaffAccess(visitId, staffUserId = null, revokedBy = null) {
        let query, values;

        if (staffUserId) {
            query = `
                UPDATE visit_staff_assignments
        SET
        access_level = 'revoked',
            revoked_at = CURRENT_TIMESTAMP,
            revoked_by = $3
                WHERE visit_id = $1 AND staff_user_id = $2 AND revoked_at IS NULL
            `;
            values = [visitId, staffUserId, revokedBy];
        } else {
            query = `
                UPDATE visit_staff_assignments
        SET
        access_level = 'revoked',
            revoked_at = CURRENT_TIMESTAMP,
            revoked_by = $2
                WHERE visit_id = $1 AND revoked_at IS NULL
            `;
            values = [visitId, revokedBy];
        }

        const result = await pool.query(query, values);
        return result.rowCount;
    }

    /**
     * Check if user has access to visit
     * @param {string} visitId 
     * @param {string} userId 
     * @returns {Promise<Object>} Access info or null
     */
    static async checkUserAccess(visitId, userId) {
        const query = `
        SELECT
        vsa.access_level,
            vsa.role,
            vsa.revoked_at,
            v.status as visit_status
            FROM visit_staff_assignments vsa
            JOIN visits v ON vsa.visit_id = v.id
            WHERE vsa.visit_id = $1 
              AND vsa.staff_user_id = $2
            `;

        const result = await pool.query(query, [visitId, userId]);
        return result.rows[0];
    }
}

module.exports = VisitModel;
