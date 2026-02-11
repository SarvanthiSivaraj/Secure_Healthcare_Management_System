const express = require('express');
const router = express.Router();
const VisitController = require('./visit.controller');
const { authenticate, authorize } = require('../../middleware/auth.middleware');

// Patient routes
router.post('/request', authenticate, authorize(['patient']), VisitController.requestVisit);
router.get('/my-visits', authenticate, authorize(['patient']), VisitController.getMyVisits);
router.post('/:id/verify-otp', authenticate, authorize(['patient']), VisitController.verifyVisitOTP);

// Staff/Admin routes
router.get('/hospital', authenticate, authorize(['hospital_admin', 'system_admin', 'doctor', 'nurse', 'receptionist']), VisitController.getHospitalVisits);
router.post('/:id/approve', authenticate, authorize(['hospital_admin', 'system_admin']), VisitController.approveVisit);
router.patch('/:id/assign', authenticate, authorize(['hospital_admin', 'system_admin', 'doctor', 'nurse', 'receptionist']), VisitController.updateVisit);

module.exports = router;
