const Interview = require('../models/Interview');
const configureGemini = require('../config/gemini');

// 1. Initialize the model (from your gemini.js file)
let geminiModel;
try {
    geminiModel = configureGemini();
} catch (error) {
    console.error('Gemini Model Init Failed:', error.message);
}

const handleChat = async (req, res) => {
    try {
        const { message, sessionId, history = [] } = req.body;
        const userId = req.user._id;

        // Validation
        if (!message || !sessionId) {
            return res.status(400).json({ success: false, message: 'Message and sessionId required' });
        }

        // 2. If the model is not loaded, try initializing again
        if (!geminiModel) {
            geminiModel = configureGemini();
        }

        // 3. Save user's message
        await Interview.create({
            userId, role: 'user', content: message, sessionId
        });

        // 4. Format chat history
        const formattedHistory = history.map(msg => ({
            role: msg.role === 'user' ? 'user' : 'model',
            parts: [{ text: msg.content }]
        }));

        // 5. System instruction logic (safest approach)
        // We directly inject the role instruction with the first message
        let finalMessage = message;
        
        if (formattedHistory.length === 0) {
            // If this is the very first message, instruct the model to role-play
            finalMessage = `Act as a strict but friendly MERN Stack Technical Interviewer. 
            Your goal is to test the candidate.
            - Ask ONE conceptual question at a time.
            - Keep answers short (max 100 words).
            - Review the candidate's answer and then ask the next question.
            
            Candidate says: "${message}"`;
        }

        // 6. Start the chat
        const chat = geminiModel.startChat({
            history: formattedHistory,
            // Configuration for gemini-2.0-flash
            generationConfig: {
                maxOutputTokens: 500,
                temperature: 0.7,
            }
        });

        // 7. Get response from the AI
        const result = await chat.sendMessage(finalMessage);
        const aiResponse = result.response.text();

        // 8. Save AI response
        const aiMessage = await Interview.create({
            userId, role: 'assistant', content: aiResponse, sessionId,
            metadata: { tokensUsed: 0 }
        });

        return res.status(200).json({
            success: true,
            data: {
                response: aiResponse,
                sessionId,
                messageId: aiMessage._id
            }
        });

    } catch (error) {
        console.error('Chat Error:', error.message);
        return res.status(500).json({
            success: false,
            message: 'Error processing chat',
            error: error.message
        });
    }
};

// History function will remain the same as before
const getChatHistory = async (req, res) => {
    try {
        const { sessionId } = req.params;
        const history = await Interview.find({ userId: req.user._id, sessionId }).sort({ timestamp: 1 });
        res.status(200).json({ success: true, data: { messages: history } });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

module.exports = { handleChat, getChatHistory };
