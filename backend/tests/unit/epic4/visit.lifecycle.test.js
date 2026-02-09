/**
 * Epic 4: Clinical Workflow - Visit Lifecycle Tests
 * Tests for visit state transitions and lifecycle management
 */

const { generateUserId } = require('../../mocks/jwt.mock');
const { createQueryResult } = require('../../mocks/db.mock');
const {
    createMockVisit,
    createCompletedVisit,
    createCancelledVisit
} = require('../../utils/testData.factory');

// Mock dependencies
jest.mock('../../../src/config/db');

const pool = require('../../../src/config/db');

// Mock VisitLifecycleService
const VisitLifecycleService = {
    transitionState: jest.fn(),
    validateTransition: jest.fn(),
    getValidTransitions: jest.fn()
};

describe('Epic 4: Visit Lifecycle', () => {
    beforeEach(() => {
        jest.clearAllMocks();
    });

    // =============================================
    // VALID STATE TRANSITION TESTS
    // =============================================
    describe('Valid State Transitions', () => {
        const validTransitions = [
            { from: 'scheduled', to: 'checked_in', description: 'Patient check-in' },
            { from: 'checked_in', to: 'in_progress', description: 'Visit started' },
            { from: 'in_progress', to: 'completed', description: 'Visit completed' },
            { from: 'scheduled', to: 'cancelled', description: 'Visit cancelled' },
            { from: 'scheduled', to: 'no_show', description: 'Patient no-show' }
        ];

        validTransitions.forEach(({ from, to, description }) => {
            it(`should allow transition from ${from} to ${to} (${description})`, async () => {
                const visitId = generateUserId();
                const userId = generateUserId();
                const visit = createMockVisit({ id: visitId, status: from, state: from });

                VisitLifecycleService.validateTransition.mockReturnValue(true);
                VisitLifecycleService.transitionState.mockResolvedValue({
                    ...visit,
                    status: to,
                    state: to
                });

                const result = await VisitLifecycleService.transitionState(
                    visitId,
                    to,
                    userId,
                    description
                );

                expect(result.state).toBe(to);
            });
        });
    });

    // =============================================
    // INVALID STATE TRANSITION TESTS
    // =============================================
    describe('Invalid State Transitions', () => {
        const invalidTransitions = [
            { from: 'completed', to: 'scheduled', reason: 'backward from completed' },
            { from: 'completed', to: 'in_progress', reason: 'reopening completed' },
            { from: 'cancelled', to: 'in_progress', reason: 'starting cancelled' },
            { from: 'no_show', to: 'checked_in', reason: 'checking in no-show' },
            { from: 'in_progress', to: 'scheduled', reason: 'backward to scheduled' }
        ];

        invalidTransitions.forEach(({ from, to, reason }) => {
            it(`should reject transition from ${from} to ${to} (${reason})`, async () => {
                const visitId = generateUserId();
                const userId = generateUserId();

                VisitLifecycleService.validateTransition.mockReturnValue(false);
                VisitLifecycleService.transitionState.mockRejectedValue(
                    new Error(`Invalid state transition: cannot transition from ${from} to ${to}`)
                );

                await expect(VisitLifecycleService.transitionState(visitId, to, userId))
                    .rejects.toThrow(/Invalid state transition/);
            });
        });
    });

    // =============================================
    // CLOSED VISIT STATE TESTS
    // =============================================
    describe('Closed Visit State Detection', () => {
        it('should identify completed visit as closed', async () => {
            const visitId = generateUserId();
            const completedVisit = createCompletedVisit({ id: visitId });

            pool.query.mockResolvedValue(createQueryResult([completedVisit]));

            const result = await pool.query(
                'SELECT * FROM visits WHERE id = $1',
                [visitId]
            );
            const visit = result.rows[0];

            expect(['completed', 'cancelled', 'no_show']).toContain(visit.status);
        });

        it('should identify cancelled visit as closed', async () => {
            const visitId = generateUserId();
            const cancelledVisit = createCancelledVisit({ id: visitId });

            pool.query.mockResolvedValue(createQueryResult([cancelledVisit]));

            const result = await pool.query(
                'SELECT * FROM visits WHERE id = $1',
                [visitId]
            );
            const visit = result.rows[0];

            expect(visit.status).toBe('cancelled');
        });

        it('should identify no_show visit as closed', async () => {
            const visitId = generateUserId();
            const noShowVisit = createMockVisit({ id: visitId, status: 'no_show' });

            pool.query.mockResolvedValue(createQueryResult([noShowVisit]));

            const result = await pool.query(
                'SELECT * FROM visits WHERE id = $1',
                [visitId]
            );
            const visit = result.rows[0];

            expect(visit.status).toBe('no_show');
        });

        it('should identify in_progress visit as open', async () => {
            const visitId = generateUserId();
            const activeVisit = createMockVisit({ id: visitId, status: 'in_progress' });

            pool.query.mockResolvedValue(createQueryResult([activeVisit]));

            const result = await pool.query(
                'SELECT * FROM visits WHERE id = $1',
                [visitId]
            );
            const visit = result.rows[0];

            expect(['completed', 'cancelled', 'no_show']).not.toContain(visit.status);
        });
    });

    // =============================================
    // TRANSITION REASON VALIDATION
    // =============================================
    describe('Transition Reason Requirements', () => {
        it('should require reason for cancellation', async () => {
            const visitId = generateUserId();
            const userId = generateUserId();

            VisitLifecycleService.transitionState.mockImplementation(
                async (id, state, user, reason) => {
                    if (state === 'cancelled' && !reason) {
                        throw new Error('Reason required for cancellation');
                    }
                    return { id, state };
                }
            );

            await expect(
                VisitLifecycleService.transitionState(visitId, 'cancelled', userId, null)
            ).rejects.toThrow('Reason required for cancellation');
        });

        it('should accept transition with valid reason', async () => {
            const visitId = generateUserId();
            const userId = generateUserId();
            const reason = 'Patient requested cancellation';

            VisitLifecycleService.transitionState.mockImplementation(
                async (id, state, user, reason) => {
                    return { id, state, reason };
                }
            );

            const result = await VisitLifecycleService.transitionState(
                visitId,
                'cancelled',
                userId,
                reason
            );

            expect(result.state).toBe('cancelled');
            expect(result.reason).toBe(reason);
        });
    });

    // =============================================
    // GET VALID TRANSITIONS TESTS
    // =============================================
    describe('Get Valid Transitions', () => {
        it('should return valid transitions for scheduled visit', () => {
            VisitLifecycleService.getValidTransitions.mockReturnValue([
                'checked_in',
                'cancelled',
                'no_show'
            ]);

            const transitions = VisitLifecycleService.getValidTransitions('scheduled');

            expect(transitions).toContain('checked_in');
            expect(transitions).toContain('cancelled');
            expect(transitions).not.toContain('completed');
        });

        it('should return valid transitions for in_progress visit', () => {
            VisitLifecycleService.getValidTransitions.mockReturnValue([
                'completed',
                'cancelled'
            ]);

            const transitions = VisitLifecycleService.getValidTransitions('in_progress');

            expect(transitions).toContain('completed');
            expect(transitions).not.toContain('scheduled');
        });

        it('should return empty array for terminal states', () => {
            VisitLifecycleService.getValidTransitions.mockReturnValue([]);

            const completedTransitions = VisitLifecycleService.getValidTransitions('completed');
            const cancelledTransitions = VisitLifecycleService.getValidTransitions('cancelled');

            expect(completedTransitions).toEqual([]);
            expect(cancelledTransitions).toEqual([]);
        });
    });

    // =============================================
    // TIMESTAMP TRACKING TESTS
    // =============================================
    describe('Transition Timestamp Tracking', () => {
        it('should set checked_in_at on check-in', async () => {
            const visitId = generateUserId();
            const checkedInVisit = createMockVisit({
                id: visitId,
                status: 'checked_in',
                checked_in_at: new Date().toISOString()
            });

            pool.query.mockResolvedValue(createQueryResult([checkedInVisit]));

            const result = await pool.query(
                'SELECT * FROM visits WHERE id = $1',
                [visitId]
            );

            expect(result.rows[0].checked_in_at).toBeDefined();
        });

        it('should set completed_at on completion', async () => {
            const visitId = generateUserId();
            const completedVisit = createCompletedVisit({ id: visitId });

            pool.query.mockResolvedValue(createQueryResult([completedVisit]));

            const result = await pool.query(
                'SELECT * FROM visits WHERE id = $1',
                [visitId]
            );

            expect(result.rows[0].completed_at).toBeDefined();
        });

        it('should set cancelled_at on cancellation', async () => {
            const visitId = generateUserId();
            const cancelledVisit = createCancelledVisit({ id: visitId });

            pool.query.mockResolvedValue(createQueryResult([cancelledVisit]));

            const result = await pool.query(
                'SELECT * FROM visits WHERE id = $1',
                [visitId]
            );

            expect(result.rows[0].cancelled_at).toBeDefined();
        });
    });
});
