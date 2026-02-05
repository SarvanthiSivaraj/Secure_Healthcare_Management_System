/**
 * Bed Allocation Model
 * Manages hospital bed assignments
 */

const pool = require('../config/db');
const logger = require('../utils/logger');

class BedAllocationModel {
    /**
     * Allocate a bed to a visit
     * @param {Object} allocationData - Allocation data
     * @returns {Promise<Object>} Created allocation
     */
    static async allocateBed(allocationData) {
        try {
            const {
                visitId,
                ward,
                room,
                bed,
                bedType,
                allocatedBy,
                notes
            } = allocationData;

            // Check if bed is available
            const available = await this.isBedAvailable(ward, room, bed);
            if (!available) {
                throw new Error('Bed is already occupied');
            }

            const query = `
                INSERT INTO bed_allocations (
                    visit_id, ward, room, bed, bed_type, allocated_by, notes
                ) VALUES ($1, $2, $3, $4, $5, $6, $7)
                RETURNING *
            `;

            const result = await pool.query(query, [
                visitId, ward, room, bed, bedType, allocatedBy, notes
            ]);

            logger.info('Bed allocated', {
                allocationId: result.rows[0].id,
                ward,
                room,
                bed
            });

            return result.rows[0];
        } catch (error) {
            logger.error('Failed to allocate bed:', error);
            throw error;
        }
    }

    /**
     * Release a bed
     * @param {String} allocationId - Allocation ID
     * @param {String} releasedBy - User ID
     * @returns {Promise<Object>} Updated allocation
     */
    static async releaseBed(allocationId, releasedBy) {
        try {
            const query = `
                UPDATE bed_allocations
                SET status = 'released',
                    released_at = NOW(),
                    released_by = $1,
                    updated_at = NOW()
                WHERE id = $2 AND status = 'occupied'
                RETURNING *
            `;

            const result = await pool.query(query, [releasedBy, allocationId]);

            if (result.rows.length === 0) {
                throw new Error('Allocation not found or already released');
            }

            logger.info('Bed released', {
                allocationId,
                releasedBy
            });

            return result.rows[0];
        } catch (error) {
            logger.error('Failed to release bed:', error);
            throw error;
        }
    }

    /**
     * Check if a bed is available
     * @param {String} ward - Ward name
     * @param {String} room - Room number
     * @param {String} bed - Bed number
     * @returns {Promise<Boolean>} True if available
     */
    static async isBedAvailable(ward, room, bed) {
        try {
            const query = `
                SELECT id
                FROM bed_allocations
                WHERE ward = $1 AND room = $2 AND bed = $3 AND status = 'occupied'
            `;

            const result = await pool.query(query, [ward, room, bed]);
            return result.rows.length === 0;
        } catch (error) {
            logger.error('Failed to check bed availability:', error);
            throw error;
        }
    }

    /**
     * Get available beds in a ward
     * @param {String} ward - Ward name
     * @param {String} bedType - Optional bed type filter
     * @returns {Promise<Array>} Available beds
     */
    static async getAvailableBeds(ward, bedType = null) {
        try {
            // This is a simplified version - in production, you'd have a beds inventory table
            // For now, we'll return beds that are not currently occupied
            let query = `
                SELECT DISTINCT ward, room, bed, bed_type
                FROM bed_allocations
                WHERE ward = $1 AND status = 'released'
            `;

            const params = [ward];

            if (bedType) {
                query += ' AND bed_type = $2';
                params.push(bedType);
            }

            query += ' ORDER BY room, bed';

            const result = await pool.query(query, params);
            return result.rows;
        } catch (error) {
            logger.error('Failed to get available beds:', error);
            throw error;
        }
    }

    /**
     * Get current bed allocation for a visit
     * @param {String} visitId - Visit ID
     * @returns {Promise<Object>} Current allocation
     */
    static async getVisitAllocation(visitId) {
        try {
            const query = `
                SELECT *
                FROM bed_allocations
                WHERE visit_id = $1 AND status = 'occupied'
                ORDER BY allocated_at DESC
                LIMIT 1
            `;

            const result = await pool.query(query, [visitId]);
            return result.rows[0];
        } catch (error) {
            logger.error('Failed to get visit allocation:', error);
            throw error;
        }
    }

    /**
     * Transfer patient to a different bed
     * @param {String} visitId - Visit ID
     * @param {Object} newBedData - New bed data
     * @param {String} transferredBy - User ID
     * @returns {Promise<Object>} New allocation
     */
    static async transferBed(visitId, newBedData, transferredBy) {
        try {
            // Release current bed
            const currentQuery = `
                UPDATE bed_allocations
                SET status = 'released',
                    released_at = NOW(),
                    released_by = $1,
                    updated_at = NOW()
                WHERE visit_id = $2 AND status = 'occupied'
                RETURNING id
            `;

            await pool.query(currentQuery, [transferredBy, visitId]);

            // Allocate new bed
            const newAllocation = await this.allocateBed({
                visitId,
                ward: newBedData.ward,
                room: newBedData.room,
                bed: newBedData.bed,
                bedType: newBedData.bedType,
                allocatedBy: transferredBy,
                notes: 'Transferred from another bed'
            });

            logger.info('Patient transferred to new bed', {
                visitId,
                newBed: `${newBedData.ward}-${newBedData.room}-${newBedData.bed}`
            });

            return newAllocation;
        } catch (error) {
            logger.error('Failed to transfer bed:', error);
            throw error;
        }
    }

    /**
     * Get ward occupancy summary
     * @param {String} ward - Ward name
     * @returns {Promise<Object>} Occupancy summary
     */
    static async getWardOccupancy(ward) {
        try {
            const query = `
                SELECT 
                    COUNT(*) FILTER (WHERE status = 'occupied') as occupied,
                    COUNT(*) FILTER (WHERE status = 'released') as available,
                    COUNT(*) FILTER (WHERE status = 'cleaning') as cleaning,
                    COUNT(*) FILTER (WHERE status = 'maintenance') as maintenance
                FROM bed_allocations
                WHERE ward = $1
            `;

            const result = await pool.query(query, [ward]);
            return result.rows[0];
        } catch (error) {
            logger.error('Failed to get ward occupancy:', error);
            throw error;
        }
    }
}

module.exports = BedAllocationModel;
