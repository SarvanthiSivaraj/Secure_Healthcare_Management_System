const pool = require('../../config/db');
const LabResultModel = require('../../models/lab_result.model');
const { HTTP_STATUS } = require('../../utils/constants');
const logger = require('../../utils/logger');

/**
 * GET /api/lab/stats
 * Dashboard stats for the lab technician
 * Uses: lab_results (actual table in DB), medical_records
 */
const getStats = async (req, res) => {
    try {
        // pending = medical_records of lab type with NO lab_result yet
        const pendingRes = await pool.query(`
            SELECT COUNT(*)
            FROM medical_records mr
            WHERE mr.type IN ('lab_order', 'lab_request', 'laboratory', 'lab')
              AND NOT EXISTS (
                SELECT 1 FROM lab_results lr WHERE lr.record_id = mr.id
              )
        `);

        // completed today
        const completedTodayRes = await pool.query(`
            SELECT COUNT(*) FROM lab_results
            WHERE uploaded_at >= CURRENT_DATE
        `);

        // total uploaded
        const totalRes = await pool.query(`SELECT COUNT(*) FROM lab_results`);

        res.status(HTTP_STATUS.OK).json({
            success: true,
            data: {
                pending: parseInt(pendingRes.rows[0].count),
                completedToday: parseInt(completedTodayRes.rows[0].count),
                totalUploaded: parseInt(totalRes.rows[0].count)
            }
        });
    } catch (error) {
        logger.error('Failed to get lab stats:', error);
        res.status(HTTP_STATUS.INTERNAL_SERVER_ERROR).json({
            success: false,
            message: 'Failed to fetch lab statistics'
        });
    }
};

/**
 * GET /api/lab/orders
 * Returns medical_records that represent pending lab requests
 * (records of lab/lab_order type that have no lab_result yet)
 */
const getAssignedOrders = async (req, res) => {
    try {
        const result = await pool.query(`
            SELECT
                mr.id,
                mr.visit_id,
                mr.type AS test_category,
                mr.title AS test_name,
                mr.description AS notes,
                mr.created_at AS requested_time,
                mr.patient_id,
                u_patient.first_name || ' ' || u_patient.last_name AS patient_name,
                u_doctor.first_name || ' ' || u_doctor.last_name AS doctor
            FROM medical_records mr
            INNER JOIN users u_patient ON mr.patient_id = u_patient.id
            LEFT JOIN users u_doctor ON mr.created_by = u_doctor.id
            WHERE mr.type IN ('lab_order', 'lab_request', 'laboratory', 'lab')
              AND NOT EXISTS (
                SELECT 1 FROM lab_results lr WHERE lr.record_id = mr.id
              )
            ORDER BY mr.created_at ASC
            LIMIT 100
        `);

        res.status(HTTP_STATUS.OK).json({
            success: true,
            data: result.rows
        });
    } catch (error) {
        logger.error('Failed to get assigned lab orders:', error);
        res.status(HTTP_STATUS.INTERNAL_SERVER_ERROR).json({
            success: false,
            message: 'Failed to fetch assigned lab orders'
        });
    }
};

/**
 * GET /api/lab/orders/:id
 * Returns details of a single medical_record (lab request)
 */
const getOrderById = async (req, res) => {
    try {
        const { id } = req.params;
        const result = await pool.query(`
            SELECT
                mr.id,
                mr.visit_id,
                mr.type AS test_category,
                mr.title AS test_name,
                mr.description AS notes,
                mr.created_at AS requested_time,
                mr.patient_id,
                u_patient.first_name || ' ' || u_patient.last_name AS patient_name,
                u_doctor.first_name || ' ' || u_doctor.last_name AS doctor
            FROM medical_records mr
            INNER JOIN users u_patient ON mr.patient_id = u_patient.id
            LEFT JOIN users u_doctor ON mr.created_by = u_doctor.id
            WHERE mr.id = $1
        `, [id]);

        if (result.rows.length === 0) {
            return res.status(HTTP_STATUS.NOT_FOUND).json({
                success: false,
                message: 'Lab order not found'
            });
        }

        res.status(HTTP_STATUS.OK).json({
            success: true,
            data: result.rows[0]
        });
    } catch (error) {
        logger.error('Failed to get lab order by ID:', error);
        res.status(HTTP_STATUS.INTERNAL_SERVER_ERROR).json({
            success: false,
            message: 'Failed to fetch lab order'
        });
    }
};

/**
 * POST /api/lab/upload
 * Upload a lab result file linked to a medical_record
 * Body (multipart): record_id (required), test_name, test_code, test_category, notes
 */
const uploadResult = async (req, res) => {
    try {
        const technicianId = req.user.id;
        const {
            order_id,
            record_id,
            test_name,
            test_code,
            test_category,
            notes
        } = req.body;

        // Support both order_id and record_id (both refer to medical_records.id)
        const medicalRecordId = record_id || order_id;

        if (!medicalRecordId) {
            return res.status(HTTP_STATUS.BAD_REQUEST).json({
                success: false,
                message: 'record_id is required'
            });
        }

        // Verify the medical record exists and get ordered_by
        const recordCheck = await pool.query(
            'SELECT id, created_by FROM medical_records WHERE id = $1',
            [medicalRecordId]
        );
        if (recordCheck.rows.length === 0) {
            return res.status(HTTP_STATUS.NOT_FOUND).json({
                success: false,
                message: 'Medical record not found'
            });
        }

        let fileUrl = null;
        let fileName = null;
        let fileType = null;
        let fileSize = 0;

        if (req.file) {
            fileUrl = req.file.path;
            fileName = req.file.originalname;
            fileType = req.file.mimetype;
            fileSize = req.file.size;
        }

        const orderedBy = recordCheck.rows[0].created_by;

        // Create the lab result record
        const labResult = await LabResultModel.create({
            recordId: medicalRecordId,
            testName: test_name || 'Lab Test',
            testCode: test_code || null,
            testCategory: test_category || null,
            fileUrl,
            fileName,
            fileType,
            fileSize,
            resultsData: notes ? { notes } : null,
            interpretation: null,
            referenceRange: null,
            abnormalFlag: false,
            orderedBy,
            performedBy: technicianId,
            resultDate: new Date()
        });

        logger.info('Lab result uploaded', {
            labResultId: labResult.id,
            recordId: medicalRecordId,
            technicianId
        });

        res.status(HTTP_STATUS.CREATED).json({
            success: true,
            message: 'Lab result uploaded successfully',
            data: labResult
        });
    } catch (error) {
        logger.error('Failed to upload lab result:', error);
        res.status(HTTP_STATUS.INTERNAL_SERVER_ERROR).json({
            success: false,
            message: 'Failed to upload lab result'
        });
    }
};

/**
 * GET /api/lab/results
 * Returns previously uploaded lab results (Test History tab)
 */
const getUploadedResults = async (req, res) => {
    try {
        const { limit = 50, offset = 0 } = req.query;

        const result = await pool.query(`
            SELECT
                lr.id,
                lr.test_name,
                lr.test_category,
                lr.file_url,
                lr.file_name,
                lr.file_type,
                lr.uploaded_at,
                lr.abnormal_flag,
                mr.patient_id,
                u_patient.first_name || ' ' || u_patient.last_name AS patient_name,
                u_tech.first_name || ' ' || u_tech.last_name AS performed_by_name
            FROM lab_results lr
            LEFT JOIN medical_records mr ON lr.record_id = mr.id
            LEFT JOIN users u_patient ON mr.patient_id = u_patient.id
            LEFT JOIN users u_tech ON lr.performed_by = u_tech.id
            ORDER BY lr.uploaded_at DESC
            LIMIT $1 OFFSET $2
        `, [limit, offset]);

        res.status(HTTP_STATUS.OK).json({
            success: true,
            data: result.rows
        });
    } catch (error) {
        logger.error('Failed to get uploaded lab results:', error);
        res.status(HTTP_STATUS.INTERNAL_SERVER_ERROR).json({
            success: false,
            message: 'Failed to fetch uploaded lab results'
        });
    }
};

module.exports = {
    getStats,
    getAssignedOrders,
    getOrderById,
    uploadResult,
    getUploadedResults
};
