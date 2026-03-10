const express = require('express');
const router = express.Router();
const chatbotController = require('../controllers/chatbotController');
const { protect, checkRole } = require('../middlewares/authMiddleware');

// Only patients should access the chatbot directly to initiate and chat
router.post('/start', protect, checkRole('patient'), chatbotController.startSession);
router.post('/message', protect, checkRole('patient'), chatbotController.sendMessage);
router.post('/analyze', protect, checkRole('patient'), chatbotController.analyzeSession);

// Doctors and patients can view the summary
router.get('/summary/:id', protect, chatbotController.getSummary);

module.exports = router;
