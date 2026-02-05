/**
 * Workflow Routes
 * Epic 4 - Clinical Workflow API endpoints
 */

const express = require('express');
const router = express.Router();
const workflowController = require('./workflow.controller');
const { authenticate } = require('../../middleware/auth.middleware');

// All workflow routes require authentication
router.use(authenticate);

// ============================================
// ONE-TIME TOKENS
// ============================================
router.post('/tokens/generate', workflowController.generateToken);
router.post('/tokens/validate', workflowController.validateToken);

// ============================================
// VISIT LIFECYCLE
// ============================================
router.patch('/visits/:id/state', workflowController.transitionVisitState);
router.get('/visits/:id/history', workflowController.getVisitStateHistory);

// ============================================
// CARE TEAM
// ============================================
router.post('/care-team', workflowController.assignCareTeam);
router.delete('/care-team/:id', workflowController.removeCareTeam);
router.get('/visits/:id/care-team', workflowController.getVisitCareTeam);

// ============================================
// LAB ORDERS
// ============================================
router.post('/lab-orders', workflowController.createLabOrder);
router.patch('/lab-orders/:id/status', workflowController.updateLabOrderStatus);
router.get('/visits/:id/lab-orders', workflowController.getVisitLabOrders);

// ============================================
// IMAGING ORDERS
// ============================================
router.post('/imaging-orders', workflowController.createImagingOrder);
router.patch('/imaging-orders/:id/status', workflowController.updateImagingOrderStatus);
router.get('/visits/:id/imaging-orders', workflowController.getVisitImagingOrders);

// ============================================
// MEDICATION ORDERS
// ============================================
router.post('/medication-orders', workflowController.createMedicationOrder);
router.patch('/medication-orders/:id/administer', workflowController.administerMedication);
router.get('/visits/:id/medication-orders', workflowController.getVisitMedicationOrders);

// ============================================
// NOTIFICATIONS
// ============================================
router.post('/notifications', workflowController.sendNotification);
router.get('/notifications', workflowController.getUserNotifications);
router.patch('/notifications/:id/read', workflowController.markNotificationRead);

// ============================================
// BED ALLOCATION
// ============================================
router.post('/bed-allocations', workflowController.allocateBed);
router.patch('/bed-allocations/:id/release', workflowController.releaseBed);
router.get('/bed-allocations/available', workflowController.getAvailableBeds);

// ============================================
// VISIT EVALUATION
// ============================================
router.get('/visits/:id/evaluate', workflowController.evaluateVisit);

// ============================================
// WORKFLOW LOGS
// ============================================
router.get('/logs', workflowController.getWorkflowLogs);

module.exports = router;
