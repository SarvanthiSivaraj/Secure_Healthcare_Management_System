const VisitModel = require('../../models/visit.model');
const VisitConsentService = require('../../services/visit-consent.service');
const { pool } = require('../../config/db'); // for direct querying if needed
const logger = require('../../utils/logger');

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

            // 2. Check for existing active visit (DISABLED FOR TESTING - allows multiple visits)
            // const existingVisit = await VisitModel.findActiveByPatient(patientId);
            // if (existingVisit) {
            //     return res.status(409).json({
            //         success: false,
            //         message: 'You already have an active visit request.',
            //         data: existingVisit
            //     });
            // }

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

            const visits = await VisitModel.findByOrganization(organizationId, {
                status: req.query.status,
                limit: req.query.limit,
                offset: req.query.offset
            });

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

            res.json({
                success: true,
                message: 'Visit approved successfully',
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
     * Get patient's own visits
     * GET /visits/my-visits
     */
    async getMyVisits(req, res) {
        try {
            const patientId = req.user.id;

            const query = `
                SELECT v.*, 
                       u.first_name as patient_first_name, 
                       u.last_name as patient_last_name,
                       u.email as patient_email,
                       d.first_name as doctor_first_name,
                       d.last_name as doctor_last_name,
                       n.first_name as nurse_first_name,
                       n.last_name as nurse_last_name,
                       o.name as organization_name
                FROM visits v
                JOIN users u ON v.patient_id = u.id
                LEFT JOIN users d ON v.assigned_doctor_id = d.id
                LEFT JOIN users n ON v.assigned_nurse_id = n.id
                LEFT JOIN organizations o ON v.organization_id = o.id
                WHERE v.patient_id = $1
                ORDER BY v.created_at DESC
            `;

            const result = await pool.query(query, [patientId]);

            res.json({
                success: true,
                visits: result.rows
            });
        } catch (error) {
            logger.error('Get my visits failed:', error);
            res.status(500).json({ success: false, message: 'Failed to get visits' });
        }
    }
};

module.exports = VisitController;
