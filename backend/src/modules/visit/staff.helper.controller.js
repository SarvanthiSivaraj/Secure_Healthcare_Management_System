const { query } = require('../../config/db');
const logger = require('../../utils/logger');

/**
 * Get staff by role (doctors, nurses, etc.)
 */
const getStaffByRole = async (req, res) => {
    try {
        const { role } = req.params;

        const staffQuery = `
            SELECT 
                u.id,
                u.first_name,
                u.last_name,
                u.email,
                r.name as role_name
            FROM users u
            JOIN roles r ON u.role_id = r.id
            WHERE r.name = $1
            AND u.status = 'active'
            AND u.is_verified = true
            ORDER BY u.first_name, u.last_name
        `;

        const result = await query(staffQuery, [role]);

        res.json({
            success: true,
            data: result.rows.map(staff => ({
                id: staff.id,
                name: `${staff.first_name} ${staff.last_name}`,
                email: staff.email,
                role: staff.role_name
            }))
        });

    } catch (error) {
        logger.error('Get staff by role failed:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to fetch staff'
        });
    }
};

module.exports = {
    getStaffByRole
};
