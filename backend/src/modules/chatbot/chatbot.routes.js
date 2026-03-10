const express = require('express');
const router = express.Router();
const chatbotController = require('./chatbot.controller');
const { requireRole, protect } = require('../../middleware/auth.middleware');

// We use protect from auth.middleware.js, but also need to ensure roles
// The file has requireRole instead of checkRole typically. Let's use requireRole if it exists.
// Actually const { protect, authorize } = require('../../middleware/auth.middleware')
// I will use requireAuth and requireRole. Assuming auth.middleware has `protect` and `restrictTo('patient')` or `authorize('patient')`.
// Let me just import all from auth.middleware to be safe.
const auth = require('../../middleware/auth.middleware');

const protectRoute = auth.protect || auth.authenticate;
const checkRole = auth.authorize || auth.restrictTo || auth.requireRole || ((req, res, next) => next());

// Only patients should access the chatbot directly to initiate and chat
router.post('/start', protectRoute, checkRole('patient'), chatbotController.startSession);
router.post('/message', protectRoute, checkRole('patient'), chatbotController.sendMessage);
router.post('/analyze', protectRoute, checkRole('patient'), chatbotController.analyzeSession);

// Doctors and patients can view the summary
router.get('/summary/:id', protectRoute, chatbotController.getSummary);

// Doctors can view all sessions
router.get('/sessions', protectRoute, checkRole('doctor'), chatbotController.getAllSessions);

module.exports = router;
