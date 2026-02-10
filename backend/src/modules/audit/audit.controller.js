const auditService = require('../../services/audit.service'); // Note: auditService is in services folder based on grep
const { catchAsync } = require('../../utils/error-handler'); // Or error.middleware? Check imports
// Actually common pattern here seems to be asyncHandler from middleware/error.middleware

const { asyncHandler } = require('../../middleware/error.middleware');

const getAllAuditLogs = asyncHandler(async (req, res) => {
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
});

const getUserAuditLogs = asyncHandler(async (req, res) => {
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
});

module.exports = {
    getAllAuditLogs,
    getUserAuditLogs
};
