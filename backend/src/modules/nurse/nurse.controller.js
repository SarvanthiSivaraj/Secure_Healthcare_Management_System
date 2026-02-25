const { query } = require('../../config/db');
const asyncHandler = require('../../utils/asyncHandler');
const logger = require('../../utils/logger');

class NurseController {
    /**
     * Get nurse dashboard statistics
     * GET /api/nurse/stats
     */
    static getDashboardStats = asyncHandler(async (req, res) => {
        const userId = req.user.id;

        try {
            // 1. Assigned Patients (Active visits where this nurse is assigned in care_team_assignments)
            const patientCountQuery = `
                SELECT COUNT(DISTINCT v.patient_id) 
                FROM visits v
                JOIN care_team_assignments cta ON v.id = cta.visit_id
                WHERE cta.staff_user_id = $1 
                AND cta.removed_at IS NULL
                AND v.state NOT IN ('cancelled', 'completed')
            `;
            const patientCount = await query(patientCountQuery, [userId]);

            // 2. Vitals Recorded (Medical records of type 'note' or containing 'vital' in title, created by this nurse today)
            const vitalsCountQuery = `
                SELECT COUNT(*) 
                FROM medical_records 
                WHERE created_by = $1 
                AND (type = 'vital_signs' OR title ILIKE '%vital%')
                AND created_at >= CURRENT_DATE
            `;
            const vitalsCount = await query(vitalsCountQuery, [userId]);

            // 3. Care Tasks (Pending medication orders for visits assigned to this nurse)
            const tasksCountQuery = `
                SELECT COUNT(*) 
                FROM medication_orders mo
                JOIN care_team_assignments cta ON mo.visit_id = cta.visit_id
                WHERE cta.staff_user_id = $1 
                AND cta.removed_at IS NULL
                AND mo.status = 'pending'
            `;
            const tasksCount = await query(tasksCountQuery, [userId]);

            // 4. Observations (All medical records created by this nurse today)
            const observationsCountQuery = `
                SELECT COUNT(*) 
                FROM medical_records 
                WHERE created_by = $1 AND created_at >= CURRENT_DATE
            `;
            const observationsCount = await query(observationsCountQuery, [userId]);

            res.json({
                success: true,
                data: {
                    assignedPatients: parseInt(patientCount.rows[0].count) || 0,
                    vitalsRecorded: parseInt(vitalsCount.rows[0].count) || 0,
                    careTasks: parseInt(tasksCount.rows[0].count) || 0,
                    observations: parseInt(observationsCount.rows[0].count) || 0
                }
            });
        } catch (error) {
            logger.error('Error fetching nurse stats:', error);
            res.status(500).json({
                success: false,
                message: 'Failed to fetch dashboard statistics'
            });
        }
    });
}

module.exports = NurseController;
