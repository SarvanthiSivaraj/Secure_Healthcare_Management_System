const express = require('express');
const router = express.Router();
const VisitController = require('./visit.controller');
const { authenticate, authorize } = require('../../middleware/auth.middleware');
const { auditLog } = require('../../middleware/audit.middleware');

// Patient routes
router.post('/request', authenticate, authorize(['patient']), auditLog('create_visit', 'visit'), VisitController.requestVisit);
router.get('/my-visits', authenticate, authorize(['patient']), VisitController.getMyVisits);
router.post('/:id/verify-otp', authenticate, authorize(['patient']), auditLog('verify_visit_otp', 'visit'), VisitController.verifyVisitOTP);

// Staff/Admin routes
router.get('/hospital', authenticate, authorize(['hospital_admin', 'system_admin', 'doctor', 'nurse', 'receptionist']), VisitController.getHospitalVisits);
router.post('/:id/approve', authenticate, authorize(['hospital_admin', 'system_admin']), auditLog('approve_visit', 'visit'), VisitController.approveVisit);
router.patch('/:id/assign', authenticate, authorize(['hospital_admin', 'system_admin', 'doctor', 'nurse', 'receptionist']), auditLog('update_visit', 'visit'), VisitController.updateVisit);

module.exports = router;
