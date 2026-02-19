const { query } = require('../../config/db');
const asyncHandler = require('../../utils/asyncHandler');
const { ORGANIZATION_STATUS, AUDIT_ACTIONS } = require('../../utils/constants');
const { createAuditLog } = require('../../services/audit.service');
const { verifyOrganization: verifyOrgModel } = require('../../models/organization.model');

/**
 * Admin Controller
 * Handles administrative tasks like verifying organizations
 */
class AdminController {
    /**
     * Get pending organizations
     * GET /api/admin/organizations/pending
     */
    static getPendingOrganizations = asyncHandler(async (req, res) => {
        const selectQuery = `
            SELECT o.*, u.email as admin_email, u.phone as admin_phone, u.first_name, u.last_name
            FROM organizations o
            JOIN users u ON o.admin_user_id = u.id
            WHERE o.status = $1
            ORDER BY o.created_at DESC
        `;

        const result = await query(selectQuery, [ORGANIZATION_STATUS.PENDING]);

        res.json({
            success: true,
            count: result.rows.length,
            data: result.rows
        });
    });

    /**
     * Approve organization
     * POST /api/admin/organizations/:orgId/approve
     */
    static approveOrganization = asyncHandler(async (req, res) => {
        const { orgId } = req.params;

        // Verify organization in DB (updates status to active and verified=true)
        const organization = await verifyOrgModel(orgId);

        if (!organization) {
             return res.status(404).json({
                success: false,
                message: 'Organization not found'
            });
        }

        // Also update the admin user status to 'active' and is_verified=true
        // detailed logic might be needed to only activate if not already active?
        // But for this flow, user is pending until org is approved.
        await query(
            'UPDATE users SET status = $1, is_verified = true WHERE id = $2',
            ['active', organization.admin_user_id]
        );

        // Audit log
        await createAuditLog({
            userId: req.user.id,
            action: 'approve_organization',
            entityType: 'organization',
            entityId: orgId,
            purpose: 'Admin approved organization',
            ipAddress: req.ip,
            userAgent: req.headers['user-agent'],
            requestMethod: req.method,
            requestPath: req.path,
            statusCode: 200
        });

        res.json({
            success: true,
            message: 'Organization approved successfully',
            data: organization
        });
    });

    /**
     * Reject organization
     * POST /api/admin/organizations/:orgId/reject
     */
    static rejectOrganization = asyncHandler(async (req, res) => {
        const { orgId } = req.params;
        const { reason } = req.body;

        if (!reason) {
            return res.status(400).json({
                success: false,
                message: 'Rejection reason is required'
            });
        }

        // Update organization status to rejected
        const orgResult = await query(
            'UPDATE organizations SET status = $1 WHERE id = $2 RETURNING *',
            ['rejected', orgId] // Assuming 'rejected' is valid status. Schema says: active, inactive, pending, suspended. I added 'rejected' in schema update!
        );
        
        const organization = orgResult.rows[0];

        if (!organization) {
             return res.status(404).json({
                success: false,
                message: 'Organization not found'
            });
        }
        
        // Update user status
        await query(
            'UPDATE users SET status = $1 WHERE id = $2',
            ['rejected', organization.admin_user_id]
        );

        // Audit log
        await createAuditLog({
            userId: req.user.id,
            action: 'reject_organization',
            entityType: 'organization',
            entityId: orgId,
            purpose: `Admin rejected organization: ${reason}`,
            ipAddress: req.ip,
            userAgent: req.headers['user-agent'],
            requestMethod: req.method,
            requestPath: req.path,
            statusCode: 200
        });

        res.json({
            success: true,
            message: 'Organization rejected',
            data: organization
        });
    });
}

module.exports = AdminController;
