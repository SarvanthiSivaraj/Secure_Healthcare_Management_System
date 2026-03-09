const RadiologyReportModel = require('../../models/radiology_report.model');
const ImagingOrderModel = require('../../models/imaging_order.model');
const UserModel = require('../../models/user.model');
const AuditService = require('../../services/audit.service');
const { HTTP_STATUS } = require('../../utils/constants');
const logger = require('../../utils/logger');
const pool = require('../../config/db');

/**
 * Get radiologist dashboard statistics
 */
const getStats = async (req, res) => {
    try {
        const radiologistId = req.user.id;

        // Count pending reads (ordered, scheduled, in_progress)
        const pendingRes = await pool.query(
            "SELECT COUNT(*) FROM imaging_orders WHERE status IN ('ordered', 'scheduled', 'in_progress') AND routed_to_department LIKE 'Radiology%'"
        );

        // Count in progress
        const inProgressRes = await pool.query(
            "SELECT COUNT(*) FROM imaging_orders WHERE status = 'in_progress' AND routed_to_department LIKE 'Radiology%'"
        );

        // Count completed today
        const completedTodayRes = await pool.query(
            "SELECT COUNT(*) FROM imaging_orders WHERE status = 'completed' AND completed_at >= CURRENT_DATE AND routed_to_department LIKE 'Radiology%'"
        );

        // Count priority (stat) cases
        const priorityRes = await pool.query(
            "SELECT COUNT(*) FROM imaging_orders WHERE status != 'completed' AND priority = 'stat' AND routed_to_department LIKE 'Radiology%'"
        );

        res.status(HTTP_STATUS.OK).json({
            success: true,
            data: {
                pendingReads: parseInt(pendingRes.rows[0].count),
                inProgress: parseInt(inProgressRes.rows[0].count),
                completedToday: parseInt(completedTodayRes.rows[0].count),
                priorityCases: parseInt(priorityRes.rows[0].count)
            }
        });
    } catch (error) {
        logger.error('Failed to get radiology stats:', error);
        res.status(HTTP_STATUS.INTERNAL_SERVER_ERROR).json({
            success: false,
            message: 'Failed to fetch radiology statistics'
        });
    }
};

/**
 * Get imaging orders for the queue
 */
const getOrders = async (req, res) => {
    try {
        const { status, priority, limit = 50, offset = 0 } = req.query;

        const orders = await ImagingOrderModel.getAllRadiologyOrders({ status, limit, offset });

        res.status(HTTP_STATUS.OK).json({
            success: true,
            data: orders
        });
    } catch (error) {
        logger.error('Failed to get radiology orders:', error);
        res.status(HTTP_STATUS.INTERNAL_SERVER_ERROR).json({
            success: false,
            message: 'Failed to fetch imaging orders'
        });
    }
};

/**
 * Upload imaging report
 */
const uploadReport = async (req, res) => {
    try {
        const { orderId, patientId, reportTitle, findings, impression, recommendations } = req.body;
        const radiologistId = req.user.id;

        let filePath = null;
        let fileName = null;
        let fileSize = 0;

        if (req.file) {
            filePath = req.file.path;
            fileName = req.file.originalname;
            fileSize = req.file.size;
        }

        const report = await RadiologyReportModel.createReport({
            orderId,
            patientId,
            radiologistId,
            reportTitle,
            findings,
            impression,
            recommendations,
            filePath,
            fileName,
            fileSize
        });

        res.status(HTTP_STATUS.CREATED).json({
            success: true,
            message: 'Report uploaded successfully',
            data: report
        });
    } catch (error) {
        logger.error('Failed to upload radiology report:', error);
        res.status(HTTP_STATUS.INTERNAL_SERVER_ERROR).json({
            success: false,
            message: 'Failed to upload report'
        });
    }
};

/**
 * Get radiologist profile
 */
const getProfile = async (req, res) => {
    try {
        const userId = req.user.id;
        const user = await pool.query(
            "SELECT id, email, first_name, last_name, phone, profile_photo FROM users WHERE id = $1",
            [userId]
        );

        if (user.rows.length === 0) {
            return res.status(HTTP_STATUS.NOT_FOUND).json({
                success: false,
                message: 'User not found'
            });
        }

        res.status(HTTP_STATUS.OK).json({
            success: true,
            data: user.rows[0]
        });
    } catch (error) {
        logger.error('Failed to get radiologist profile:', error);
        res.status(HTTP_STATUS.INTERNAL_SERVER_ERROR).json({
            success: false,
            message: 'Failed to fetch profile'
        });
    }
};

/**
 * Update radiologist profile
 */
const updateProfile = async (req, res) => {
    try {
        const userId = req.user.id;
        const { firstName, lastName, phone } = req.body;

        const result = await pool.query(
            "UPDATE users SET first_name = $1, last_name = $2, phone = $3, updated_at = NOW() WHERE id = $4 RETURNING id, email, first_name, last_name, phone",
            [firstName, lastName, phone, userId]
        );

        res.status(HTTP_STATUS.OK).json({
            success: true,
            message: 'Profile updated successfully',
            data: result.rows[0]
        });
    } catch (error) {
        logger.error('Failed to update radiologist profile:', error);
        res.status(HTTP_STATUS.INTERNAL_SERVER_ERROR).json({
            success: false,
            message: 'Failed to update profile'
        });
    }
};

/**
 * Get radiologist audit logs
 */
const getAuditLogs = async (req, res) => {
    try {
        const userId = req.user.id;
        const logs = await AuditService.getUserAuditLogs(userId, { limit: 50 });

        res.status(HTTP_STATUS.OK).json({
            success: true,
            data: logs.rows
        });
    } catch (error) {
        logger.error('Failed to get radiology audit logs:', error);
        res.status(HTTP_STATUS.INTERNAL_SERVER_ERROR).json({
            success: false,
            message: 'Failed to fetch audit logs'
        });
    }
};

module.exports = {
    getStats,
    getOrders,
    uploadReport,
    getProfile,
    updateProfile,
    getAuditLogs
};
