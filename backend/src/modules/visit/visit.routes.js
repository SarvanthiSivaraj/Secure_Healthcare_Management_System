const express = require('express');
const router = express.Router();
const VisitController = require('./visit.controller');
const StaffHelperController = require('./staff.helper.controller');
const { authenticate, authorize } = require('../../middleware/auth.middleware');
const { auditLog } = require('../../middleware/audit.middleware');

// Staff helper routes (for getting doctors/nurses for assignment)
router.get('/staff/:role', authenticate, authorize(['hospital_admin', 'system_admin', 'doctor', 'nurse', 'receptionist']), StaffHelperController.getStaffByRole);

// Patient routes
router.post('/request', authenticate, authorize(['patient']), auditLog('create_visit', 'visit'), VisitController.requestVisit);
router.post('/:id/verify-otp', authenticate, authorize(['patient']), auditLog('verify_visit_otp', 'visit'), VisitController.verifyVisitOTP);
router.get('/:id/queue-status', authenticate, authorize(['patient']), VisitController.getQueueStatus);
router.post('/:id/access-code', authenticate, authorize(['patient']), VisitController.generateAccessCode);
router.post('/check-in', authenticate, authorize(['patient']), VisitController.checkInVisit);
router.get('/my-visits', authenticate, authorize(['patient']), VisitController.getMyVisits);

// Staff/Admin/Receptionist routes
router.get('/hospital', authenticate, authorize(['hospital_admin', 'system_admin', 'doctor', 'nurse', 'receptionist']), VisitController.getHospitalVisits);
router.get('/assigned', authenticate, authorize(['doctor', 'nurse']), VisitController.getAssignedVisits);
router.post('/:id/approve', authenticate, authorize(['hospital_admin', 'system_admin', 'receptionist']), auditLog('approve_visit', 'visit'), VisitController.approveVisit);
router.patch('/:id/assign', authenticate, authorize(['hospital_admin', 'system_admin', 'doctor', 'nurse', 'receptionist']), auditLog('update_visit', 'visit'), VisitController.updateVisit);
router.patch('/:id/scheduled-time', authenticate, authorize(['hospital_admin', 'system_admin', 'receptionist']), VisitController.updateScheduledTime);
router.post('/:id/close', authenticate, authorize(['hospital_admin', 'system_admin', 'doctor', 'receptionist']), VisitController.closeVisit);
router.get('/:id/staff', authenticate, authorize(['hospital_admin', 'doctor', 'nurse', 'receptionist']), VisitController.getVisitStaff);
router.post('/:id/assign-staff', authenticate, authorize(['hospital_admin', 'doctor', 'receptionist']), VisitController.assignStaff);

module.exports = router;
