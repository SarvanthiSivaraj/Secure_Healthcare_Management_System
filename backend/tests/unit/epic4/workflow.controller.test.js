/**
 * Epic 4: Clinical Workflow - Controller Tests
 * Tests for closed visit access and unassigned staff attempts
 */

const {
    createMockRequest,
    createMockResponse,
    createMockNext,
    createMockDoctor,
    createMockUser,
    createMockVisit,
    createCompletedVisit,
    createCancelledVisit,
    createMockCareTeamAssignment
} = require('../../utils/testData.factory');
const { generateUserId } = require('../../mocks/jwt.mock');
const { createQueryResult } = require('../../mocks/db.mock');

// Mock dependencies
jest.mock('../../../src/config/db');
jest.mock('../../../src/services/visit.lifecycle.service');
jest.mock('../../../src/services/notification.service');
jest.mock('../../../src/services/workflow.logger.service');
jest.mock('../../../src/services/audit.service');
jest.mock('../../../src/models/care_team.model');

const pool = require('../../../src/config/db');
const VisitLifecycleService = require('../../../src/services/visit.lifecycle.service');
const CareTeamModel = require('../../../src/models/care_team.model');
const { createAuditLog } = require('../../../src/services/audit.service');

// Import controller functions
const {
    createLabOrder,
    createImagingOrder,
    createMedicationOrder,
    transitionVisitState,
    assignCareTeam,
    getCareTeam,
    getVisit
} = require('../../../src/modules/workflow/workflow.controller');

describe('Epic 4: Workflow Controller', () => {
    let mockReq, mockRes, mockNext;

    beforeEach(() => {
        jest.clearAllMocks();
        mockReq = createMockRequest();
        mockRes = createMockResponse();
        mockNext = createMockNext();

        createAuditLog.mockResolvedValue({});
    });

    // =============================================
    // CLOSED VISIT ACCESS TESTS
    // =============================================
    describe('Closed Visit Access Prevention', () => {
        it('should reject lab order creation for completed visit', async () => {
            const doctor = createMockDoctor();
            const visitId = generateUserId();
            const completedVisit = createCompletedVisit({ id: visitId, status: 'completed', state: 'completed' });

            mockReq.user = doctor;
            mockReq.params = { visitId };
            mockReq.body = {
                testName: 'Blood Test',
                testType: 'hematology',
                priority: 'normal'
            };

            // Visit lookup returns completed visit
            pool.query.mockResolvedValue(createQueryResult([completedVisit]));

            await createLabOrder(mockReq, mockRes);

            expect(mockRes.status).toHaveBeenCalledWith(400);
            expect(mockRes.json).toHaveBeenCalledWith(
                expect.objectContaining({
                    success: false,
                    message: expect.stringMatching(/closed|completed|cannot/i)
                })
            );
        });

        it('should reject lab order creation for cancelled visit', async () => {
            const doctor = createMockDoctor();
            const visitId = generateUserId();
            const cancelledVisit = createCancelledVisit({ id: visitId });

            mockReq.user = doctor;
            mockReq.params = { visitId };
            mockReq.body = {
                testName: 'X-Ray',
                testType: 'radiology',
                priority: 'urgent'
            };

            pool.query.mockResolvedValue(createQueryResult([cancelledVisit]));

            await createLabOrder(mockReq, mockRes);

            expect(mockRes.status).toHaveBeenCalledWith(400);
        });

        it('should allow lab order creation for in-progress visit', async () => {
            const doctor = createMockDoctor();
            const visitId = generateUserId();
            const activeVisit = createMockVisit({ id: visitId, status: 'in_progress' });
            const orderId = generateUserId();

            mockReq.user = doctor;
            mockReq.params = { visitId };
            mockReq.body = {
                testName: 'Complete Blood Count',
                testType: 'hematology',
                priority: 'normal'
            };

            // Visit lookup
            pool.query.mockResolvedValueOnce(createQueryResult([activeVisit]));
            // Care team check  
            CareTeamModel.isStaffAssigned.mockResolvedValue(true);
            // Order creation
            pool.query.mockResolvedValueOnce(createQueryResult([{
                id: orderId,
                visit_id: visitId,
                test_name: 'Complete Blood Count',
                status: 'pending'
            }]));

            await createLabOrder(mockReq, mockRes);

            expect(mockRes.status).toHaveBeenCalledWith(201);
        });

        it('should reject imaging order creation for completed visit', async () => {
            const doctor = createMockDoctor();
            const visitId = generateUserId();

            mockReq.user = doctor;
            mockReq.params = { visitId };
            mockReq.body = {
                imagingType: 'ct',
                bodyPart: 'chest',
                priority: 'normal'
            };

            pool.query.mockResolvedValue(createQueryResult([
                createCompletedVisit({ id: visitId })
            ]));

            await createImagingOrder(mockReq, mockRes);

            expect(mockRes.status).toHaveBeenCalledWith(400);
        });

        it('should reject medication order creation for completed visit', async () => {
            const doctor = createMockDoctor();
            const visitId = generateUserId();

            mockReq.user = doctor;
            mockReq.params = { visitId };
            mockReq.body = {
                medicationName: 'Amoxicillin',
                dosage: '500mg',
                frequency: 'three times daily'
            };

            pool.query.mockResolvedValue(createQueryResult([
                createCompletedVisit({ id: visitId })
            ]));

            await createMedicationOrder(mockReq, mockRes);

            expect(mockRes.status).toHaveBeenCalledWith(400);
        });

        it('should reject invalid state transition from completed', async () => {
            const doctor = createMockDoctor();
            const visitId = generateUserId();

            mockReq.user = doctor;
            mockReq.params = { id: visitId };
            mockReq.body = {
                newState: 'in_progress',
                reason: 'Attempting to reopen'
            };

            VisitLifecycleService.transitionState.mockRejectedValue(
                new Error('Invalid state transition: cannot transition from completed to in_progress')
            );

            await transitionVisitState(mockReq, mockRes);

            expect(mockRes.status).toHaveBeenCalledWith(400);
            expect(mockRes.json).toHaveBeenCalledWith(
                expect.objectContaining({
                    message: expect.stringContaining('transition')
                })
            );
        });

        it('should allow valid state transition from in_progress to completed', async () => {
            const doctor = createMockDoctor();
            const visitId = generateUserId();

            mockReq.user = doctor;
            mockReq.params = { id: visitId };
            mockReq.body = {
                newState: 'completed',
                reason: 'Treatment finished'
            };

            VisitLifecycleService.transitionState.mockResolvedValue({
                id: visitId,
                status: 'completed',
                state: 'completed'
            });

            await transitionVisitState(mockReq, mockRes);

            expect(mockRes.json).toHaveBeenCalledWith(
                expect.objectContaining({
                    success: true,
                    data: expect.objectContaining({
                        state: 'completed'
                    })
                })
            );
        });
    });

    // =============================================
    // UNASSIGNED STAFF ATTEMPT TESTS
    // =============================================
    describe('Unassigned Staff Access Prevention', () => {
        it('should reject order from staff not assigned to care team', async () => {
            const unassignedDoctor = createMockDoctor({ id: 'unassigned-doctor' });
            const visitId = generateUserId();
            const activeVisit = createMockVisit({ id: visitId });

            mockReq.user = unassignedDoctor;
            mockReq.params = { visitId };
            mockReq.body = {
                testName: 'Unauthorized Test',
                testType: 'blood',
                priority: 'normal'
            };

            // Visit exists and is active
            pool.query.mockResolvedValueOnce(createQueryResult([activeVisit]));

            // Staff is NOT assigned to care team
            CareTeamModel.isStaffAssigned.mockResolvedValue(false);

            await createLabOrder(mockReq, mockRes);

            expect(mockRes.status).toHaveBeenCalledWith(403);
            expect(mockRes.json).toHaveBeenCalledWith(
                expect.objectContaining({
                    success: false,
                    message: expect.stringMatching(/not assigned|care team|unauthorized/i)
                })
            );
        });

        it('should allow order from assigned care team member', async () => {
            const assignedDoctor = createMockDoctor({ id: 'assigned-doctor' });
            const visitId = generateUserId();
            const activeVisit = createMockVisit({ id: visitId });
            const orderId = generateUserId();

            mockReq.user = assignedDoctor;
            mockReq.params = { visitId };
            mockReq.body = {
                testName: 'Authorized Test',
                testType: 'blood',
                priority: 'normal'
            };

            // Visit exists and is active
            pool.query.mockResolvedValueOnce(createQueryResult([activeVisit]));

            // Staff IS assigned to care team
            CareTeamModel.isStaffAssigned.mockResolvedValue(true);

            // Order creation succeeds
            pool.query.mockResolvedValueOnce(createQueryResult([{
                id: orderId,
                test_name: 'Authorized Test',
                status: 'pending'
            }]));

            await createLabOrder(mockReq, mockRes);

            expect(mockRes.status).toHaveBeenCalledWith(201);
        });

        it('should reject access to visit from different organization', async () => {
            const doctor = createMockDoctor({
                id: 'doctor-org-a',
                organization_id: 'org-a'
            });
            const visitId = generateUserId();
            const visitFromOrgB = createMockVisit({
                id: visitId,
                organization_id: 'org-b'
            });

            mockReq.user = doctor;
            mockReq.params = { visitId };
            mockReq.body = {
                testName: 'Cross-Org Test',
                testType: 'blood'
            };

            pool.query.mockResolvedValueOnce(createQueryResult([visitFromOrgB]));

            // Staff not assigned (implicit cross-org block)
            CareTeamModel.isStaffAssigned.mockResolvedValue(false);

            await createLabOrder(mockReq, mockRes);

            expect(mockRes.status).toHaveBeenCalledWith(403);
        });

        it('should allow nurse in care team to create orders', async () => {
            const nurse = createMockUser({
                id: 'nurse-1',
                role_name: 'nurse',
                roleName: 'nurse'
            });
            const visitId = generateUserId();
            const activeVisit = createMockVisit({ id: visitId });

            mockReq.user = nurse;
            mockReq.params = { visitId };
            mockReq.body = {
                testName: 'Nurse Order',
                testType: 'vitals',
                priority: 'normal'
            };

            pool.query.mockResolvedValueOnce(createQueryResult([activeVisit]));
            CareTeamModel.isStaffAssigned.mockResolvedValue(true);
            pool.query.mockResolvedValueOnce(createQueryResult([{
                id: generateUserId(),
                test_name: 'Nurse Order'
            }]));

            await createLabOrder(mockReq, mockRes);

            expect(mockRes.status).toHaveBeenCalledWith(201);
        });
    });

    // =============================================
    // CARE TEAM MANAGEMENT TESTS
    // =============================================
    describe('Care Team Management', () => {
        it('should assign staff to care team', async () => {
            const admin = createMockUser({
                role_name: 'hospital_admin',
                roleName: 'hospital_admin'
            });
            const visitId = generateUserId();
            const staffId = generateUserId();

            mockReq.user = admin;
            mockReq.params = { visitId };
            mockReq.body = {
                staffUserId: staffId,
                role: 'primary_doctor'
            };

            CareTeamModel.assignStaff.mockResolvedValue({
                id: generateUserId(),
                visit_id: visitId,
                staff_user_id: staffId,
                role: 'primary_doctor'
            });

            await assignCareTeam(mockReq, mockRes);

            expect(mockRes.status).toHaveBeenCalledWith(201);
            expect(CareTeamModel.assignStaff).toHaveBeenCalledWith(
                expect.objectContaining({
                    visitId,
                    staffUserId: staffId
                })
            );
        });

        it('should get care team for visit', async () => {
            const doctor = createMockDoctor();
            const visitId = generateUserId();
            const careTeam = [
                createMockCareTeamAssignment({ visit_id: visitId, role: 'primary_doctor' }),
                createMockCareTeamAssignment({ visit_id: visitId, role: 'nurse' })
            ];

            mockReq.user = doctor;
            mockReq.params = { visitId };

            CareTeamModel.getTeamByVisit.mockResolvedValue(careTeam);

            await getCareTeam(mockReq, mockRes);

            expect(mockRes.json).toHaveBeenCalledWith(
                expect.objectContaining({
                    success: true,
                    data: expect.arrayContaining([
                        expect.objectContaining({ role: 'primary_doctor' })
                    ])
                })
            );
        });
    });

    // =============================================
    // VISIT RETRIEVAL TESTS
    // =============================================
    describe('Visit Retrieval', () => {
        it('should get visit by ID', async () => {
            const doctor = createMockDoctor();
            const visitId = generateUserId();
            const visit = createMockVisit({ id: visitId });

            mockReq.user = doctor;
            mockReq.params = { id: visitId };

            pool.query.mockResolvedValue(createQueryResult([visit]));

            await getVisit(mockReq, mockRes);

            expect(mockRes.json).toHaveBeenCalledWith(
                expect.objectContaining({
                    success: true,
                    data: expect.objectContaining({
                        id: visitId
                    })
                })
            );
        });

        it('should return 404 for non-existent visit', async () => {
            const doctor = createMockDoctor();

            mockReq.user = doctor;
            mockReq.params = { id: generateUserId() };

            pool.query.mockResolvedValue(createQueryResult([]));

            await getVisit(mockReq, mockRes);

            expect(mockRes.status).toHaveBeenCalledWith(404);
        });
    });
});
