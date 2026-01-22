const express = require('express');
const router = express.Router();
const { handleChat, getChatHistory } = require('../controllers/chatController');
const { protect } = require('../middleware/authMiddleware');

/**
 * @route   POST /api/chat/message
 * @desc    Send a message to AI interviewer
 * @access  Private (Protected by JWT)
 */
router.post('/message', protect, handleChat);

/**
 * @route   GET /api/chat/history/:sessionId
 * @desc    Get chat history for a specific session
 * @access  Private (Protected by JWT)
 */
router.get('/history/:sessionId', protect, getChatHistory);

module.exports = router;