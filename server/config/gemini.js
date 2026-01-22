const { GoogleGenerativeAI } = require('@google/generative-ai');

/**
 * Initialize and configure Google Gemini AI instance
 * @returns {Object} Configured Gemini model instance
 */
const configureGemini = () => {
    try {
        // Initialize Google Generative AI with API key
        const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
        
        // Get the Gemini 1.5 Flash model
        const model = genAI.getGenerativeModel({
            model: 'gemini-1.5-flash',
            systemInstruction: "You are a friendly but professional technical interviewer. Ask one conceptual question at a time based on the user's stack (MERN). Wait for the answer, give short feedback, then ask the next question. Keep responses concise and focused on technical concepts."
        });
        
        console.log('Gemini AI configured successfully');
        return model;
    } catch (error) {
        console.error('Error configuring Gemini AI:', error.message);
        throw new Error('Failed to initialize AI service');
    }
};

module.exports = configureGemini;