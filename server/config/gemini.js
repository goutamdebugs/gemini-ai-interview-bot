const { GoogleGenerativeAI } = require('@google/generative-ai');
require('dotenv').config();

const configureGemini = () => {
    try {
        const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

    
        const model = genAI.getGenerativeModel({ 
            model: "gemini-flash-latest", 
        });

        console.log(' Gemini AI Configured using: gemini-flash-latest');
        return model;
    } catch (error) {
        console.error(' Gemini Config Error:', error.message);
        throw new Error('Failed to initialize AI service');
    }
};

module.exports = configureGemini;