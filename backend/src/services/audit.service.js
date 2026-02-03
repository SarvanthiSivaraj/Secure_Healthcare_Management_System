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
            conditions.push(`action = $${paramIndex}`);
            params.push(action);
            paramIndex++;
        }

        if (userId) {
            conditions.push(`user_id = $${paramIndex}`);
            params.push(userId);
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

        const whereClause = conditions.length > 0 ? `WHERE ${conditions.join(' AND ')}` : '';

        // Get total count
        const countQuery = `SELECT COUNT(*) as total FROM audit_logs ${whereClause}`;
        const countResult = await query(countQuery, params);
        const total = parseInt(countResult.rows[0].total);

        // Get logs
        const selectQuery = `
      SELECT 
        id, user_id, action, entity_type, entity_id,
        purpose, ip_address, timestamp, status_code
      FROM audit_logs
      ${whereClause}
      ORDER BY timestamp DESC
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

module.exports = {
    createAuditLog,
    getUserAuditLogs,
    getEntityAuditLogs,
    getAllAuditLogs,
    verifyAuditLogIntegrity,
};
