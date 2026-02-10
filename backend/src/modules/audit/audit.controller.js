const auditService = require('../../services/audit.service');
const logger = require('../../utils/logger');

class AuditController {
    /**
     * Get audit trail for the logged-in patient
     * Shows who accessed their medical records and what actions were performed
     */
    static async getPatientAuditTrail(req, res) {
        try {
            const patientId = req.user.id;
            const userRole = req.user.roleName;

            // Only patients can access their own audit trail
            if (userRole?.toLowerCase() !== 'patient') {
                return res.status(403).json({
                    success: false,
                    message: 'Only patients can access audit trails'
                });
            }

            const { action, startDate, endDate, limit, offset } = req.query;

            const options = {
                action,
                startDate: startDate ? new Date(startDate) : undefined,
                endDate: endDate ? new Date(endDate) : undefined,
                limit: parseInt(limit) || 50,
                offset: parseInt(offset) || 0
            };

            const result = await auditService.getPatientRecordAccessLogs(patientId, options);

            res.json({
                success: true,
                data: result
            });
        } catch (error) {
            logger.error('Get patient audit trail failed:', error);
            res.status(500).json({
                success: false,
                message: 'Failed to retrieve audit trail'
            });
        }
    }
}

module.exports = AuditController;
