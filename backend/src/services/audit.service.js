const { query } = require('../config/db');
const { createHashChain } = require('./encryption.service');
const logger = require('../utils/logger');
const config = require('../config/env');

/**
 * Create audit log entry
 * @param {Object} logData - Audit log data
 * @param {String} logData.userId - User ID performing the action
 * @param {String} logData.action - Action performed
 * @param {String} logData.entityType - Type of entity affected
 * @param {String} logData.entityId - ID of entity affected
 * @param {String} logData.purpose - Purpose of the action
 * @param {String} logData.ipAddress - IP address of the request
 * @param {String} logData.userAgent - User agent string
 * @param {String} logData.requestMethod - HTTP method
 * @param {String} logData.requestPath - Request path
 * @param {Number} logData.statusCode - HTTP status code
 * @param {Object} logData.metadata - Additional metadata
 * @returns {Promise<Object>} Created audit log
 */
const createAuditLog = async (logData) => {
    try {
        const {
            userId,
            action,
            entityType,
            entityId,
            purpose,
            ipAddress,
            userAgent,
            requestMethod,
            requestPath,
            statusCode,
            metadata,
        } = logData;

        let previousHash = '';
        let currentHash = '';

        // If hash chain is enabled, get the previous hash
        if (config.audit.enableHashChain) {
            const lastLogQuery = `
        SELECT current_hash
        FROM audit_logs
        ORDER BY timestamp DESC
        LIMIT 1
      `;
            const lastLogResult = await query(lastLogQuery);

            if (lastLogResult.rows.length > 0) {
                previousHash = lastLogResult.rows[0].current_hash;
            }

            // Create hash chain
            const dataToHash = JSON.stringify({
                userId,
                action,
                entityType,
                entityId,
                timestamp: new Date().toISOString(),
            });
            currentHash = createHashChain(dataToHash, previousHash);
        }

        // Insert audit log
        const insertQuery = `
      INSERT INTO audit_logs (
        user_id, action, entity_type, entity_id, purpose,
        ip_address, user_agent, request_method, request_path,
        status_code, metadata, previous_hash, current_hash
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13)
      RETURNING *
    `;

        const result = await query(insertQuery, [
            userId || null,
            action,
            entityType || null,
            entityId || null,
            purpose || null,
            ipAddress || null,
            userAgent || null,
            requestMethod || null,
            requestPath || null,
            statusCode || null,
            metadata ? JSON.stringify(metadata) : null,
            previousHash || null,
            currentHash || null,
        ]);

        logger.debug('Audit log created', { action, userId, entityType });

        return result.rows[0];
    } catch (error) {
        logger.error('Failed to create audit log:', error);
        // Don't throw error to prevent audit logging from breaking the main flow
        return null;
    }
};

/**
 * Get audit logs for a user
 * @param {String} userId - User ID
 * @param {Object} options - Query options
 * @param {Number} options.limit - Number of records to return
 * @param {Number} options.offset - Offset for pagination
 * @param {String} options.action - Filter by action
 * @param {Date} options.startDate - Start date filter
 * @param {Date} options.endDate - End date filter
 * @returns {Promise<Array>} Audit logs
 */
const getUserAuditLogs = async (userId, options = {}) => {
    try {
        const {
            limit = 50,
            offset = 0,
            action,
            startDate,
            endDate,
        } = options;

        let conditions = ['user_id = $1'];
        let params = [userId];
        let paramIndex = 2;

        if (action) {
            conditions.push(`action = $${paramIndex}`);
            params.push(action);
            paramIndex++;
        }

        if (startDate) {
            conditions.push(`timestamp >= $${paramIndex}`);
            params.push(startDate);
            paramIndex++;
        }

        if (endDate) {
            conditions.push(`timestamp <= $${paramIndex}`);
            params.push(endDate);
            paramIndex++;
        }

        const selectQuery = `
      SELECT 
        id, user_id, action, entity_type, entity_id,
        purpose, ip_address, timestamp, status_code
      FROM audit_logs
      WHERE ${conditions.join(' AND ')}
      ORDER BY timestamp DESC
      LIMIT $${paramIndex} OFFSET $${paramIndex + 1}
    `;

        params.push(limit, offset);

        const result = await query(selectQuery, params);

        return result.rows;
    } catch (error) {
        logger.error('Failed to get user audit logs:', error);
        throw error;
    }
};

/**
 * Get audit logs for an entity
 * @param {String} entityType - Entity type
 * @param {String} entityId - Entity ID
 * @param {Object} options - Query options
 * @returns {Promise<Array>} Audit logs
 */
const getEntityAuditLogs = async (entityType, entityId, options = {}) => {
    try {
        const { limit = 50, offset = 0 } = options;

        const selectQuery = `
      SELECT 
        id, user_id, action, entity_type, entity_id,
        purpose, ip_address, timestamp, status_code, metadata
      FROM audit_logs
      WHERE entity_type = $1 AND entity_id = $2
      ORDER BY timestamp DESC
      LIMIT $3 OFFSET $4
    `;

        const result = await query(selectQuery, [entityType, entityId, limit, offset]);

        return result.rows;
    } catch (error) {
        logger.error('Failed to get entity audit logs:', error);
        throw error;
    }
};

/**
 * Get all audit logs (admin only)
 * @param {Object} options - Query options
 * @returns {Promise<Object>} Audit logs with pagination info
 */
const getAllAuditLogs = async (options = {}) => {
    try {
        const {
            limit = 50,
            offset = 0,
            action,
            userId,
            startDate,
            endDate,
        } = options;

        let conditions = [];
        let params = [];
        let paramIndex = 1;

        if (action) {
            conditions.push(`a.action = $${paramIndex}`);
            params.push(action);
            paramIndex++;
        }

        if (userId) {
            conditions.push(`a.user_id = $${paramIndex}`);
            params.push(userId);
            paramIndex++;
        }

        if (startDate) {
            conditions.push(`a.timestamp >= $${paramIndex}`);
            params.push(startDate);
            paramIndex++;
        }

        if (endDate) {
            conditions.push(`a.timestamp <= $${paramIndex}`);
            params.push(endDate);
            paramIndex++;
        }

        const whereClause = conditions.length > 0 ? `WHERE ${conditions.join(' AND ')}` : '';

        // Get total count
        const countQuery = `SELECT COUNT(*) as total FROM audit_logs a ${whereClause}`;
        const countResult = await query(countQuery, params);
        const total = parseInt(countResult.rows[0].total);

        // Get logs
        const selectQuery = `
      SELECT 
        a.id, a.user_id, a.action, a.entity_type as resource, a.entity_id,
        a.purpose as details, a.ip_address, a.request_method, a.request_path, a.timestamp, a.status_code,
        u.email as user_email
      FROM audit_logs a
      LEFT JOIN users u ON a.user_id = u.id
      ${whereClause}
      ORDER BY a.timestamp DESC
      LIMIT $${paramIndex} OFFSET $${paramIndex + 1}
    `;

        params.push(limit, offset);

        const result = await query(selectQuery, params);

        return {
            logs: result.rows,
            pagination: {
                total,
                limit,
                offset,
                pages: Math.ceil(total / limit),
            },
        };
    } catch (error) {
        logger.error('Failed to get all audit logs:', error);
        throw error;
    }
};

/**
 * Verify audit log integrity (hash chain)
 * @returns {Promise<Object>} Verification result
 */
const verifyAuditLogIntegrity = async () => {
    try {
        if (!config.audit.enableHashChain) {
            return { verified: true, message: 'Hash chain not enabled' };
        }

        const logsQuery = `
      SELECT id, user_id, action, entity_type, entity_id, timestamp, previous_hash, current_hash
      FROM audit_logs
      ORDER BY timestamp ASC
    `;

        const result = await query(logsQuery);
        const logs = result.rows;

        let previousHash = '';
        let tamperedLogs = [];

        for (const log of logs) {
            const dataToHash = JSON.stringify({
                userId: log.user_id,
                action: log.action,
                entityType: log.entity_type,
                entityId: log.entity_id,
                timestamp: log.timestamp,
            });

            const expectedHash = createHashChain(dataToHash, previousHash);

            if (log.current_hash !== expectedHash) {
                tamperedLogs.push(log.id);
            }

            previousHash = log.current_hash;
        }

        if (tamperedLogs.length > 0) {
            logger.warn('Audit log integrity check failed', { tamperedLogs });
            return {
                verified: false,
                message: 'Audit log tampering detected',
                tamperedLogs,
            };
        }

        return {
            verified: true,
            message: 'Audit log integrity verified',
            totalLogs: logs.length,
        };
    } catch (error) {
        logger.error('Failed to verify audit log integrity:', error);
        throw error;
    }
};

/**
 * Get audit logs for patient record access
 * @param {String} patientId - Patient User ID
 * @param {Object} options - Query options
 * @returns {Promise<Object>} Audit logs with user details and pagination
 */
const getPatientRecordAccessLogs = async (patientId, options = {}) => {
    try {
        const { limit = 50, offset = 0, action, startDate, endDate } = options;

        let conditions = [`(a.user_id = $1 OR a.entity_id = $1 OR (a.metadata->>'patientId')::uuid = $1)`];
        let params = [patientId];
        let paramIndex = 2;

        const relevantActions = [
            'view_medical_record', 'create_medical_record', 'update_medical_record', 'view_patient_records',
            'consent_grant', 'consent_revoke', 'consent_expired', 'consent_view',
            'create_diagnosis', 'create_prescription', 'upload_lab_result', 'upload_imaging_report',
            'user_login', 'user_register',
            // Visit Actions
            'create_visit', 'approve_visit', 'update_visit', 'verify_visit_otp',
            // Clinical Workflow Actions
            'create_lab_order', 'create_imaging_order', 'create_medication_order'
        ];

        logger.info('=== AUDIT TRAIL DEBUG ===');
        logger.info(`Patient ID: ${patientId}`);
        logger.info(`Relevant actions: ${JSON.stringify(relevantActions)}`);

        if (action) {
            conditions.push(`a.action = $${paramIndex}`);
            params.push(action);
            paramIndex++;
        } else {
            conditions.push(`a.action = ANY($${paramIndex})`);
            params.push(relevantActions);
            paramIndex++;
        }

        if (startDate) {
            conditions.push(`a.timestamp >= $${paramIndex}`);
            params.push(startDate);
            paramIndex++;
        }

        if (endDate) {
            conditions.push(`a.timestamp <= $${paramIndex}`);
            params.push(endDate);
            paramIndex++;
        }

        const whereClause = `WHERE ${conditions.join(' AND ')}`;
        logger.info(`Where clause: ${whereClause}`);
        logger.info(`Params: ${JSON.stringify(params)}`);

        const countQuery = `SELECT COUNT(*) as total FROM audit_logs a ${whereClause}`;
        const countResult = await query(countQuery, params);
        const total = parseInt(countResult.rows[0].total);
        logger.info(`Total matching logs: ${total}`);

        const selectQuery = `
            SELECT 
                a.id, a.user_id as "userId", a.action, a.entity_type as "entityType",
                a.entity_id as "entityId", a.purpose, a.ip_address as "ipAddress",
                a.timestamp, a.metadata,
                u.first_name as "userFirstName", u.last_name as "userLastName",
                u.email as "userEmail", r.name as "userRole"
            FROM audit_logs a
            LEFT JOIN users u ON a.user_id = u.id
            LEFT JOIN roles r ON u.role_id = r.id
            ${whereClause}
            ORDER BY a.timestamp DESC
            LIMIT $${paramIndex} OFFSET $${paramIndex + 1}
        `;

        params.push(limit, offset);
        const result = await query(selectQuery, params);
        logger.info(`Returned ${result.rows.length} logs`);
        if (result.rows.length > 0) {
            logger.info(`First log: ${JSON.stringify(result.rows[0])}`);
        }

        return {
            logs: result.rows,
            pagination: { total, limit, offset, pages: Math.ceil(total / limit) }
        };
    } catch (error) {
        logger.error('Failed to get patient record access logs:', error);
        throw error;
    }
};

module.exports = {
    createAuditLog,
    getUserAuditLogs,
    getEntityAuditLogs,
    getAllAuditLogs,
    verifyAuditLogIntegrity,
    getPatientRecordAccessLogs,
};
