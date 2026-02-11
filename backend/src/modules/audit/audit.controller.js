const auditService = require('../../services/audit.service');
const logger = require('../../utils/logger');

class AuditController {
    /**
     * Get all audit logs (Admin only)
     */
    static async getAllAuditLogs(req, res) {
        try {
            // Get query params for filtering/pagination
            const options = {
                page: parseInt(req.query.page, 10) || 1,
                limit: parseInt(req.query.limit, 10) || 20,
                sortBy: req.query.sortBy || 'timestamp',
                sortOrder: req.query.sortOrder || 'desc',
                action: req.query.action,
                userId: req.query.userId,
                startDate: req.query.startDate,
                endDate: req.query.endDate
            };

            const result = await auditService.getAllAuditLogs(options);

            res.status(200).json({
                success: true,
                data: result.logs,
                pagination: result.pagination
            });
        } catch (error) {
            logger.error('Get all audit logs failed:', error);
            res.status(500).json({
                success: false,
                message: 'Failed to retrieve audit logs'
            });
        }
    }

    /**
     * Get audit logs for a specific user (Admin only)
     */
    static async getUserAuditLogs(req, res) {
        try {
            const { userId } = req.params;
            const options = {
                page: parseInt(req.query.page, 10) || 1,
                limit: parseInt(req.query.limit, 10) || 20
            };

            const logs = await auditService.getUserAuditLogs(userId, options);

            res.status(200).json({
                success: true,
                data: logs
            });
        } catch (error) {
            logger.error('Get user audit logs failed:', error);
            res.status(500).json({
                success: false,
                message: 'Failed to retrieve user audit logs'
            });
        }
    }

    /**
     * Get audit trail for the logged-in patient
     * Shows who accessed their medical records and what actions were performed
     */
    static async getPatientAuditTrail(req, res) {
        try {
            const patientId = req.user.id;
            const userRole = req.user.role || req.user.roleName; // Handle both cases



            // Only patients can access their own audit trail
            // Assuming role check is done in middleware, but double check here
            if (userRole?.toLowerCase() !== 'patient') {
                logger.warn(`DEBUG: Access denied. Role '${userRole}' is not 'patient'`);
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
