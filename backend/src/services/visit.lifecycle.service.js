/**
 * Visit Lifecycle State Machine Service
 * Manages visit state transitions with validation and business rules
 */

const pool = require('../config/db');
const logger = require('../utils/logger');

// Define valid states and transitions
const VISIT_STATES = {
    SCHEDULED: 'scheduled',
    CHECKED_IN: 'checked_in',
    IN_PROGRESS: 'in_progress',
    COMPLETED: 'completed',
    CANCELLED: 'cancelled',
    NO_SHOW: 'no_show'
};

// Define valid state transitions
const VALID_TRANSITIONS = {
    [VISIT_STATES.SCHEDULED]: [VISIT_STATES.CHECKED_IN, VISIT_STATES.CANCELLED, VISIT_STATES.NO_SHOW],
    [VISIT_STATES.CHECKED_IN]: [VISIT_STATES.IN_PROGRESS, VISIT_STATES.CANCELLED],
    [VISIT_STATES.IN_PROGRESS]: [VISIT_STATES.COMPLETED, VISIT_STATES.CANCELLED],
    [VISIT_STATES.COMPLETED]: [], // Terminal state
    [VISIT_STATES.CANCELLED]: [], // Terminal state
    [VISIT_STATES.NO_SHOW]: [] // Terminal state
};

class VisitLifecycleService {
    /**
     * Transition visit to a new state
     * @param {String} visitId - Visit ID
     * @param {String} newState - Target state
     * @param {String} userId - User performing the transition
     * @param {String} reason - Optional reason for transition
     * @returns {Promise<Object>} Updated visit
     */
    static async transitionState(visitId, newState, userId, reason = null) {
        try {
            // Get current visit state
            const visitQuery = 'SELECT id, state, patient_id FROM visits WHERE id = $1';
            const visitResult = await pool.query(visitQuery, [visitId]);

            if (visitResult.rows.length === 0) {
                throw new Error('Visit not found');
            }

            const visit = visitResult.rows[0];
            const currentState = visit.state;

            // Validate transition
            if (!this.isValidTransition(currentState, newState)) {
                throw new Error(
                    `Invalid state transition from ${currentState} to ${newState}`
                );
            }

            // Prepare update query based on new state
            const timestamp = new Date();
            let updateQuery = 'UPDATE visits SET state = $1, updated_at = $2';
            const params = [newState, timestamp];
            let paramIndex = 3;

            // Set appropriate timestamp column based on state
            switch (newState) {
                case VISIT_STATES.CHECKED_IN:
                    updateQuery += `, checked_in_at = $${paramIndex}`;
                    params.push(timestamp);
                    paramIndex++;
                    break;
                case VISIT_STATES.IN_PROGRESS:
                    updateQuery += `, started_at = $${paramIndex}`;
                    params.push(timestamp);
                    paramIndex++;
                    break;
                case VISIT_STATES.COMPLETED:
                    updateQuery += `, completed_at = $${paramIndex}`;
                    params.push(timestamp);
                    paramIndex++;
                    break;
                case VISIT_STATES.CANCELLED:
                    updateQuery += `, cancelled_at = $${paramIndex}`;
                    params.push(timestamp);
                    paramIndex++;
                    break;
                case VISIT_STATES.NO_SHOW:
                    updateQuery += `, no_show_at = $${paramIndex}`;
                    params.push(timestamp);
                    paramIndex++;
                    break;
            }

            updateQuery += ` WHERE id = $${paramIndex} RETURNING *`;
            params.push(visitId);

            // Execute update
            const result = await pool.query(updateQuery, params);
            const updatedVisit = result.rows[0];

            // Log the state transition
            await this.logStateTransition(visitId, currentState, newState, userId, reason);

            logger.info('Visit state transitioned', {
                visitId,
                from: currentState,
                to: newState,
                userId
            });

            return updatedVisit;
        } catch (error) {
            logger.error('Failed to transition visit state:', error);
            throw error;
        }
    }

    /**
     * Check if a state transition is valid
     * @param {String} currentState - Current state
     * @param {String} newState - Target state
     * @returns {Boolean} True if transition is valid
     */
    static isValidTransition(currentState, newState) {
        if (!VALID_TRANSITIONS[currentState]) {
            return false;
        }
        return VALID_TRANSITIONS[currentState].includes(newState);
    }

    /**
     * Get all valid next states for a visit
     * @param {String} visitId - Visit ID
     * @returns {Promise<Array>} Array of valid next states
     */
    static async getValidNextStates(visitId) {
        try {
            const query = 'SELECT state FROM visits WHERE id = $1';
            const result = await pool.query(query, [visitId]);

            if (result.rows.length === 0) {
                throw new Error('Visit not found');
            }

            const currentState = result.rows[0].state;
            return VALID_TRANSITIONS[currentState] || [];
        } catch (error) {
            logger.error('Failed to get valid next states:', error);
            throw error;
        }
    }

    /**
     * Get visit state history
     * @param {String} visitId - Visit ID
     * @returns {Promise<Array>} State transition history
     */
    static async getStateHistory(visitId) {
        try {
            const query = `
                SELECT 
                    old_state->>'state' as from_state,
                    new_state->>'state' as to_state,
                    user_id,
                    metadata->>'reason' as reason,
                    created_at
                FROM workflow_logs
                WHERE visit_id = $1 
                    AND action = 'visit_state_transition'
                ORDER BY created_at ASC
            `;

            const result = await pool.query(query, [visitId]);
            return result.rows;
        } catch (error) {
            logger.error('Failed to get state history:', error);
            throw error;
        }
    }

    /**
     * Log state transition to workflow_logs
     * @param {String} visitId - Visit ID
     * @param {String} oldState - Previous state
     * @param {String} newState - New state
     * @param {String} userId - User performing transition
     * @param {String} reason - Optional reason
     */
    static async logStateTransition(visitId, oldState, newState, userId, reason) {
        try {
            const query = `
                INSERT INTO workflow_logs (
                    visit_id, user_id, action, entity_type, entity_id,
                    old_state, new_state, metadata
                ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
            `;

            await pool.query(query, [
                visitId,
                userId,
                'visit_state_transition',
                'visit',
                visitId,
                JSON.stringify({ state: oldState }),
                JSON.stringify({ state: newState }),
                JSON.stringify({ reason })
            ]);
        } catch (error) {
            logger.error('Failed to log state transition:', error);
            // Don't throw - logging failure shouldn't break the transition
        }
    }

    /**
     * Bulk check-in visits (e.g., for scheduled appointments)
     * @param {Array} visitIds - Array of visit IDs
     * @param {String} userId - User performing check-in
     * @returns {Promise<Object>} Results summary
     */
    static async bulkCheckIn(visitIds, userId) {
        const results = {
            success: [],
            failed: []
        };

        for (const visitId of visitIds) {
            try {
                await this.transitionState(visitId, VISIT_STATES.CHECKED_IN, userId);
                results.success.push(visitId);
            } catch (error) {
                results.failed.push({ visitId, error: error.message });
            }
        }

        return results;
    }

    /**
     * Auto-transition no-show visits (scheduled visits that weren't checked in)
     * @param {Number} minutesAfterScheduled - Minutes after scheduled time to mark as no-show
     * @returns {Promise<Number>} Number of visits marked as no-show
     */
    static async autoMarkNoShows(minutesAfterScheduled = 30) {
        try {
            const query = `
                UPDATE visits
                SET state = $1, no_show_at = NOW(), updated_at = NOW()
                WHERE state = $2
                    AND visit_date < NOW() - INTERVAL '${minutesAfterScheduled} minutes'
                RETURNING id
            `;

            const result = await pool.query(query, [
                VISIT_STATES.NO_SHOW,
                VISIT_STATES.SCHEDULED
            ]);

            const count = result.rows.length;

            if (count > 0) {
                logger.info(`Auto-marked ${count} visits as no-show`);

                // Log each transition
                for (const row of result.rows) {
                    await this.logStateTransition(
                        row.id,
                        VISIT_STATES.SCHEDULED,
                        VISIT_STATES.NO_SHOW,
                        null, // System action
                        'Auto-marked as no-show after scheduled time'
                    );
                }
            }

            return count;
        } catch (error) {
            logger.error('Failed to auto-mark no-shows:', error);
            throw error;
        }
    }
}

// Export states for use in other modules
VisitLifecycleService.STATES = VISIT_STATES;
VisitLifecycleService.VALID_TRANSITIONS = VALID_TRANSITIONS;

module.exports = VisitLifecycleService;
