const VisitModel = require('../../models/visit.model');
const VisitConsentService = require('../../services/visit-consent.service');
const { pool } = require('../../config/db'); // for direct querying if needed
const logger = require('../../utils/logger');
const { sendVisitApprovalEmail, sendVisitClosureEmail } = require('../../config/mail');

const VisitController = {
    /**
     * Patient requests a visit using hospital code
     */
    async requestVisit(req, res) {
        try {
            const { hospitalCode, reason, symptoms } = req.body;
            const patientId = req.user.id;

            if (!hospitalCode) {
                return res.status(400).json({ success: false, message: 'Hospital code is required' });
            }

            // 1. Find Organization by Code
            // We need a helper or direct query here since OrganizationModel might not have findByCode yet
            // Let's use direct query for now or add to OrgModel. Let's assume direct for speed.
            const orgRes = await require('../../config/db').query(
                'SELECT id, name FROM organizations WHERE hospital_code = $1',
                [hospitalCode]
            );

            if (orgRes.rows.length === 0) {
                return res.status(404).json({ success: false, message: 'Invalid hospital code' });
            }

            const organization = orgRes.rows[0];

            // 2. Check for existing active visit
            const existingVisit = await VisitModel.findActiveByPatient(patientId);
            if (existingVisit) {
                return res.status(409).json({
                    success: false,
                    message: 'You already have an active visit request.',
                    data: existingVisit
                });
            }

            // 3. Create Visit
            const visit = await VisitModel.create({
                patientId,
                organizationId: organization.id,
                reason,
                symptoms,
                type: 'walk_in', // Default for code entry
                priority: 'normal'
            });

            res.status(201).json({
                success: true,
                message: `Successfully requested visit at ${organization.name}`,
                data: visit
            });

        } catch (error) {
            logger.error('Request visit failed:', error);
            res.status(500).json({ success: false, message: 'Failed to request visit' });
        }
    },

    /**
     * Get visits for the staff's organization
     */
    async getHospitalVisits(req, res) {
        try {
            const userId = req.user.id;
            // Get organization from mapping
            // Should be in req.user if updated middleware, but let's query to be safe
            const mappingRes = await require('../../config/db').query(
                'SELECT organization_id FROM staff_org_mapping WHERE user_id = $1 AND status = \'active\'',
                [userId]
            );

            if (mappingRes.rows.length === 0) {
                return res.status(403).json({ success: false, message: 'You are not linked to any active organization' });
            }

            const organizationId = mappingRes.rows[0].organization_id;
            const tests = req.query.status;

            console.log(`🏥 Fetching visits for Org: ${organizationId}, Status: ${req.query.status}`);

            const visits = await VisitModel.findByOrganization(organizationId, {
                status: req.query.status,
                limit: req.query.limit,
                offset: req.query.offset
            });

            console.log(`✅ Found ${visits.length} visits for Org ${organizationId}`);

            res.json({
                success: true,
                data: visits
            });

        } catch (error) {
            logger.error('Get hospital visits failed:', error);
            res.status(500).json({ success: false, message: 'Failed to fetch visits' });
        }
    },

    /**
     * Get visits for the logged-in patient
     */
    async getMyVisits(req, res) {
        try {
            const userId = req.user.id;
            const visits = await VisitModel.findByPatientId(userId);

            res.json({
                success: true,
                data: visits
            });
        } catch (error) {
            logger.error('Get my visits failed:', error);
            res.status(500).json({ success: false, message: 'Failed to fetch visits' });
        }
    },

    /**
     * Get visits assigned to the logged-in doctor/nurse
     */
    async getAssignedVisits(req, res) {
        try {
            const userId = req.user.id;
            // Auth middleware sets roleName, fall back to role just in case
            const role = (req.user.roleName || req.user.role)?.toLowerCase();

            logger.info(`Fetching assigned visits for user ${userId} with role ${role}`);

            if (!['doctor', 'nurse'].includes(role)) {
                return res.status(403).json({ success: false, message: 'Only doctors and nurses can view assigned visits' });
            }

            const visits = await VisitModel.findByAssignedStaff(userId, role);
            logger.info(`Found ${visits.length} assigned visits`);

            res.json({
                success: true,
                data: visits
            });
        } catch (error) {
            logger.error('Get assigned visits failed:', error);
            res.status(500).json({ success: false, message: 'Failed to fetch assigned visits' });
        }
    },

    /**
     * Admin/Staff updates visit (Assign Dr, Change Status)
     */
    async updateVisit(req, res) {
        try {
            const { id } = req.params;
            const updateData = req.body;

            // TODO: Add strict permission checks (e.g. only Admin/Doctor can assign)

            const updatedVisit = await VisitModel.update(id, updateData);

            if (!updatedVisit) {
                return res.status(404).json({ success: false, message: 'Visit not found' });
            }

            res.json({
                success: true,
                message: 'Visit updated successfully',
                data: updatedVisit
            });

        } catch (error) {
            logger.error('Update visit failed:', error);
            res.status(500).json({ success: false, message: 'Failed to update visit' });
        }
    },

    /**
     * Admin approves visit, assigns staff, and generates OTP
     */
    async approveVisit(req, res) {
        try {
            const { id } = req.params;
            const { doctorId, nurseId, scheduledTime } = req.body;

            console.log('=== APPROVE VISIT DEBUG ===');
            console.log('Visit ID:', id);
            console.log('Doctor ID:', doctorId);
            console.log('Nurse ID:', nurseId);
            console.log('Scheduled Time:', scheduledTime);

            if (!doctorId) {
                return res.status(400).json({ success: false, message: 'Doctor ID is required' });
            }

            // First update scheduled time if provided
            if (scheduledTime) {
                console.log('Updating scheduled time...');
                const updateResult = await VisitModel.update(id, { scheduledTime });
                console.log('Update result:', updateResult);
            }

            // Approve visit and generate OTP
            console.log('Approving visit...');
            const updatedVisit = await VisitModel.approveVisit(id, doctorId, nurseId || null);
            console.log('Approve result:', updatedVisit);

            if (!updatedVisit) {
                return res.status(404).json({ success: false, message: 'Visit not found' });
            }

            // Get full visit details for email
            const visitDetails = await VisitModel.getFullDetails(id);

            // Send approval email with visit code
            try {
                await sendVisitApprovalEmail(visitDetails.patient_email, {
                    visit_code: visitDetails.otp_code,
                    hospital_name: visitDetails.organization_name,
                    reason: visitDetails.reason,
                    scheduled_date: visitDetails.created_at
                });
                logger.info(`Visit approval email sent to ${visitDetails.patient_email}`);
            } catch (emailError) {
                logger.error('Failed to send visit approval email:', emailError);
                // Don't fail the request if email fails
            }

            res.json({
                success: true,
                message: 'Visit approved successfully. Approval email sent to patient.',
                data: {
                    ...updatedVisit,
                    // Return OTP for display to admin/patient
                    otp: updatedVisit.otp_code
                }
            });

        } catch (error) {
            console.error('=== APPROVE VISIT ERROR ===');
            console.error('Error details:', error);
            logger.error('Approve visit failed:', error);
            res.status(500).json({ success: false, message: 'Failed to approve visit', error: error.message });
        }
    },

    /**
     * Patient verifies OTP and selects access level
     */
    async verifyVisitOTP(req, res) {
        try {
            const { id } = req.params;
            const { otp, accessLevel } = req.body;
            const patientId = req.user.id;

            if (!otp || !accessLevel) {
                return res.status(400).json({
                    success: false,
                    message: 'OTP and access level are required'
                });
            }

            if (!['read', 'write'].includes(accessLevel)) {
                return res.status(400).json({
                    success: false,
                    message: 'Access level must be "read" or "write"'
                });
            }

            // Verify OTP and update visit
            const updatedVisit = await VisitModel.verifyOTP(id, otp, accessLevel);

            // Get full visit details for consent creation
            const visitDetails = await VisitModel.getFullDetails(id);

            // Verify patient owns this visit
            if (visitDetails.patient_id !== patientId) {
                return res.status(403).json({
                    success: false,
                    message: 'Unauthorized'
                });
            }

            // Create automatic consent
            try {
                await VisitConsentService.createConsentForVisit(visitDetails, accessLevel);
            } catch (consentError) {
                logger.error('Failed to create consent:', consentError);
                // Continue even if consent creation fails - can be created manually
            }

            res.json({
                success: true,
                message: 'OTP verified successfully. Doctor has been granted access.',
                data: {
                    visitId: updatedVisit.id,
                    status: updatedVisit.status,
                    accessLevel: updatedVisit.access_level
                }
            });

        } catch (error) {
            if (error.message === 'Invalid or expired OTP') {
                return res.status(400).json({ success: false, message: error.message });
            }
            logger.error('Verify OTP failed:', error);
            res.status(500).json({ success: false, message: 'Failed to verify OTP' });
        }
    },

    /**
     * Patient generates access code for a visit
     */
    async generateAccessCode(req, res) {
        try {
            const { id } = req.params;
            const patientId = req.user.id;

            // 1. Verify visit ownership
            const visit = await VisitModel.findById(id);

            if (!visit) {
                return res.status(404).json({ success: false, message: 'Visit not found' });
            }

            if (visit.patient_id !== patientId) {
                return res.status(403).json({ success: false, message: 'Unauthorized access to this visit' });
            }

            // 2. Generate Code
            const result = await VisitModel.generateAccessCode(id);

            res.json({
                success: true,
                message: 'Access code generated successfully',
                data: {
                    visitId: id,
                    accessCode: result.otp_code,
                    expiresAt: result.otp_expires_at
                }
            });

        } catch (error) {
            logger.error('Generate access code failed:', error);
            res.status(500).json({ success: false, message: 'Failed to generate access code' });
        }
    },

    /**
     * Patient check-in using visit code
     */
    async checkInVisit(req, res) {
        try {
            const { visitCode } = req.body;
            const patientId = req.user.id;

            console.log(`🔍 Check-in Attempt: Code=${visitCode}, User=${patientId}`);

            if (!visitCode) {
                return res.status(400).json({ success: false, message: 'Visit code is required' });
            }

            // Find visit by code
            const visit = await VisitModel.findByCode(visitCode);

            if (!visit) {
                console.log(`❌ Visit not found for code: ${visitCode}`);
                return res.status(404).json({ success: false, message: 'Invalid visit code' });
            }

            console.log(`✅ Visit found: ID=${visit.id}, Patient=${visit.patient_id}, Status=${visit.status}`);

            // Verify patient owns this visit
            if (visit.patient_id !== patientId) {
                console.warn(`⚠️ Ownership mismatch: VisitOwner=${visit.patient_id}, RequestUser=${patientId}`);
                console.warn(`⚠️ User Email: ${req.user.email}`); // Log email to be sure
                return res.status(403).json({ success: false, message: 'This visit does not belong to you' });
            }

            // Check if visit is in approved status
            if (visit.status !== 'approved') {
                console.warn(`⚠️ Invalid status: ${visit.status}`);
                return res.status(400).json({
                    success: false,
                    message: `Cannot check in. Visit status is: ${visit.status}`
                });
            }

            // Update status to checked_in
            const updatedVisit = await VisitModel.updateStatus(visit.id, 'checked_in', patientId);
            console.log(`✅ Check-in successful for visit ${visit.id}`);

            res.json({
                success: true,
                message: 'Successfully checked in',
                data: updatedVisit
            });

        } catch (error) {
            console.error('Check-in failed:', error);
            res.status(500).json({
                success: false,
                message: error.message || 'Failed to check in',
                stack: error.stack
            });
        }
    },

    /**
     * Close visit (complete or cancel)
     */
    async closeVisit(req, res) {
        try {
            const { id } = req.params;
            const { status } = req.body; // 'completed' or 'cancelled'
            const userId = req.user.id;

            if (!status || !['completed', 'cancelled'].includes(status)) {
                return res.status(400).json({
                    success: false,
                    message: 'Status must be either completed or cancelled'
                });
            }

            // Close visit (triggers automatic access revocation)
            const closedVisit = await VisitModel.closeVisit(id, userId, status);

            if (!closedVisit) {
                return res.status(404).json({ success: false, message: 'Visit not found' });
            }

            // Get full details for email
            const visitDetails = await VisitModel.getFullDetails(id);

            // Send closure email
            try {
                await sendVisitClosureEmail(visitDetails.patient_email, {
                    visit_code: visitDetails.visit_code,
                    hospital_name: visitDetails.organization_name,
                    status: status
                });
                logger.info(`Visit closure email sent to ${visitDetails.patient_email}`);
            } catch (emailError) {
                logger.error('Failed to send visit closure email:', emailError);
            }

            res.json({
                success: true,
                message: `Visit ${status} successfully. Staff access has been revoked.`,
                data: closedVisit
            });

        } catch (error) {
            logger.error('Close visit failed:', error);
            res.status(500).json({ success: false, message: 'Failed to close visit' });
        }
    },

    /**
     * Get staff assigned to a visit
     */
    async getVisitStaff(req, res) {
        try {
            const { id } = req.params;

            const staff = await VisitModel.getAssignedStaff(id);

            res.json({
                success: true,
                data: staff
            });

        } catch (error) {
            logger.error('Get visit staff failed:', error);
            res.status(500).json({ success: false, message: 'Failed to get visit staff' });
        }
    },

    /**
     * Assign additional staff to visit
     */
    async assignStaff(req, res) {
        try {
            const { id } = req.params;
            const { staffUserId, role } = req.body;

            if (!staffUserId || !role) {
                return res.status(400).json({
                    success: false,
                    message: 'Staff user ID and role are required'
                });
            }

            const assignment = await VisitModel.assignStaff(id, staffUserId, role);

            res.json({
                success: true,
                message: 'Staff assigned successfully',
                data: assignment
            });

        } catch (error) {
            logger.error('Assign staff failed:', error);
            res.status(500).json({ success: false, message: 'Failed to assign staff' });
        }
    }
};

module.exports = VisitController;
