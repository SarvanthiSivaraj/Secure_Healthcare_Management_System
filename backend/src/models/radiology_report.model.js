const pool = require('../config/db');
const logger = require('../utils/logger');

class RadiologyReportModel {
    /**
     * Create a radiology report
     * @param {Object} reportData - Report data
     * @returns {Promise<Object>} Created report
     */
    static async createReport(reportData) {
        try {
            const {
                orderId,
                patientId,
                radiologistId,
                reportTitle,
                findings,
                impression,
                recommendations,
                filePath,
                fileName,
                fileSize,
                status = 'finalized'
            } = reportData;

            const query = `
                INSERT INTO radiology_reports (
                    imaging_order_id, patient_id, radiologist_id,
                    report_title, findings, impression, recommendations,
                    file_path, file_name, file_size, status, finalized_at
                ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, NOW())
                RETURNING *
            `;

            const result = await pool.query(query, [
                orderId, patientId, radiologistId,
                reportTitle, findings, impression, recommendations,
                filePath, fileName, fileSize, status
            ]);

            // Update imaging order status to 'completed'
            await pool.query(
                'UPDATE imaging_orders SET status = $1, completed_at = NOW() WHERE id = $2',
                ['completed', orderId]
            );

            logger.info('Radiology report created and order completed', {
                reportId: result.rows[0].id,
                orderId
            });

            return result.rows[0];
        } catch (error) {
            logger.error('Failed to create radiology report:', error);
            throw error;
        }
    }

    /**
     * Get report by order ID
     * @param {String} orderId - Imaging order ID
     * @returns {Promise<Object>} Radiology report
     */
    static async getByOrderId(orderId) {
        try {
            const query = `
                SELECT rr.*, u.first_name || ' ' || u.last_name as radiologist_name
                FROM radiology_reports rr
                LEFT JOIN users u ON rr.radiologist_id = u.id
                WHERE rr.imaging_order_id = $1
            `;
            const result = await pool.query(query, [orderId]);
            return result.rows[0];
        } catch (error) {
            logger.error('Failed to get radiology report by order ID:', error);
            throw error;
        }
    }
}

module.exports = RadiologyReportModel;
