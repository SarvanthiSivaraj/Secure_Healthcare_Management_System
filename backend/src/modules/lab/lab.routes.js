const express = require('express');
const router = express.Router();
const labController = require('./lab.controller');
const { authenticate } = require('../../middleware/auth.middleware');
const { auditLog } = require('../../middleware/audit.middleware');
const { uploadSingle, handleUploadError } = require('../../middleware/file.upload.middleware');

// All lab routes require authentication
router.use(authenticate);

/**
 * @route  GET /api/lab/stats
 * @desc   Lab technician dashboard statistics
 * @access Private (Lab Technician)
 */
router.get('/stats', labController.getStats);

/**
 * @route  GET /api/lab/orders
 * @desc   Get all pending/in-progress lab orders (the assigned queue)
 * @access Private (Lab Technician)
 */
router.get('/orders', auditLog('view_lab_queue', 'lab_order'), labController.getAssignedOrders);

/**
 * @route  GET /api/lab/orders/:id
 * @desc   Get details for a specific lab order
 * @access Private (Lab Technician)
 */
router.get('/orders/:id', auditLog('view_lab_order', 'lab_order'), labController.getOrderById);

/**
 * @route  POST /api/lab/upload
 * @desc   Upload a lab result file and mark the order as completed
 * @access Private (Lab Technician)
 */
router.post(
    '/upload',
    uploadSingle,
    handleUploadError,
    auditLog('upload_lab_result', 'lab_result'),
    labController.uploadResult
);

/**
 * @route  GET /api/lab/results
 * @desc   Get previously uploaded lab results (Test History)
 * @access Private (Lab Technician)
 */
router.get('/results', auditLog('view_lab_results', 'lab_result'), labController.getUploadedResults);

module.exports = router;
