const Interview = require('../models/Interview');
const configureGemini = require('../config/gemini');

// Initialize Gemini model
let geminiModel;
try {
    geminiModel = configureGemini();
} catch (error) {
    console.error('Failed to initialize Gemini:', error.message);
}

/**
 * Handle interview chat messages
 * @route POST /api/chat/message
 */
const handleChat = async (req, res) => {
    try {
        const { message, sessionId, history = [] } = req.body;
        const userId = req.user._id;
        
        // Validate required fields
        if (!message || !sessionId) {
            return res.status(400).json({
                success: false,
                message: 'Message and sessionId are required'
            });
        }
        
        // Validate message length
        if (message.trim().length === 0) {
            return res.status(400).json({
                success: false,
                message: 'Message cannot be empty'
            });
        }
        
        // Save user's message to database
        const userMessage = await Interview.create({
            userId,
            role: 'user',
            content: message,
            sessionId
        });
        
        // Format chat history for Gemini
        const formattedHistory = history.map(msg => ({
            role: msg.role === 'user' ? 'user' : 'model',
            parts: [{ text: msg.content }]
        }));
        
        // Add current user message to history
        formattedHistory.push({
            role: 'user',
            parts: [{ text: message }]
        });
        
        // Start timing the AI response
        const startTime = Date.now();
        
        // Generate AI response using Gemini
        const chat = geminiModel.startChat({
            history: formattedHistory,
            generationConfig: {
                temperature: 0.7,
                topP: 0.9,
                topK: 40,
                maxOutputTokens: 500,
            }
        });
        
        const result = await chat.sendMessage(message);
        const aiResponse = result.response.text();
        
        // Calculate response time
        const responseTime = Date.now() - startTime;
        
        // Save AI response to database
        const aiMessage = await Interview.create({
            userId,
            role: 'assistant',
            content: aiResponse,
            sessionId,
            metadata: {
                responseTime,
                tokensUsed: result.response.usageMetadata?.totalTokenCount || 0
            }
        });
        
        // Return the AI response
        return res.status(200).json({
            success: true,
            data: {
                response: aiResponse,
                sessionId,
                messageId: aiMessage._id,
                timestamp: aiMessage.timestamp,
                metadata: {
                    responseTime,
                    tokensUsed: aiMessage.metadata?.tokensUsed
                }
            }
        });
        
    } catch (error) {
        console.error('Chat error:', error.message);
        
        // Handle specific Gemini API errors
        if (error.message.includes('API key')) {
            return res.status(500).json({
                success: false,
                message: 'AI service configuration error'
            });
        }
        
        if (error.message.includes('safety')) {
            return res.status(400).json({
                success: false,
                message: 'Message blocked by safety filters'
            });
        }
        
        return res.status(500).json({
            success: false,
            message: 'Error processing chat message',
            error: error.message
        });
    }
};

/**
 * Get chat history for a session
 * @route GET /api/chat/history/:sessionId
 */
const getChatHistory = async (req, res) => {
    try {
        const { sessionId } = req.params;
        const userId = req.user._id;
        
        // Validate session ID
        if (!sessionId) {
            return res.status(400).json({
                success: false,
                message: 'Session ID is required'
            });
        }
        
        // Fetch chat history for this session
        const history = await Interview.find({
            userId,
            sessionId
        })
        .sort({ timestamp: 1 }) // Sort by timestamp ascending
        .select('role content timestamp metadata')
        .lean();
        
        return res.status(200).json({
            success: true,
            data: {
                sessionId,
                messages: history,
                count: history.length
            }
        });
        
    } catch (error) {
        console.error('History fetch error:', error.message);
        
        return res.status(500).json({
            success: false,
            message: 'Error fetching chat history',
            error: error.message
        });
    }
};

module.exports = { handleChat, getChatHistory };