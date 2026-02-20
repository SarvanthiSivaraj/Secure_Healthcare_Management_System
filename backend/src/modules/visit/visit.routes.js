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

// Staff/Admin routes
router.get('/hospital', authenticate, authorize(['hospital_admin', 'system_admin', 'doctor', 'nurse', 'receptionist', 'lab_technician', 'pharmacist']), VisitController.getHospitalVisits);
router.post('/:id/approve', authenticate, authorize(['hospital_admin', 'system_admin']), auditLog('approve_visit', 'visit'), VisitController.approveVisit);
router.patch('/:id/assign', authenticate, authorize(['hospital_admin', 'system_admin', 'doctor', 'nurse', 'receptionist']), auditLog('update_visit', 'visit'), VisitController.updateVisit);
router.get('/assigned', authenticate, authorize(['doctor', 'nurse']), VisitController.getAssignedVisits);
router.post('/:id/close', authenticate, authorize(['hospital_admin', 'system_admin', 'doctor']), VisitController.closeVisit);
router.get('/:id/staff', authenticate, authorize(['hospital_admin', 'doctor', 'nurse']), VisitController.getVisitStaff);
router.post('/:id/assign-staff', authenticate, authorize(['hospital_admin', 'doctor']), VisitController.assignStaff);
router.post('/:id/access-code', authenticate, authorize(['patient']), VisitController.generateAccessCode);
router.post('/check-in', authenticate, authorize(['patient']), VisitController.checkInVisit);
router.get('/my-visits', authenticate, authorize(['patient']), VisitController.getMyVisits);



module.exports = router;
