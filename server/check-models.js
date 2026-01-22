require('dotenv').config();
const { GoogleGenerativeAI } = require("@google/generative-ai");

async function listModels() {
  try {
    const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
    // Fetch the list of currently available models
    const model = genAI.getGenerativeModel({ model: "gemini-pro" }); // Dummy init
    
    // Asking the API which models are available
    // Note: In this SDK version, there may not be a direct listModels function,
    // so we test with a basic model instead.
    
    console.log("Testing connection with API Key...");
    const result = await model.generateContent("Hello");
    console.log("Success! Response:", result.response.text());
    
  } catch (error) {
    console.error("\nERROR DETAILS:");
    console.error("Message:", error.message);
    
    if (error.message.includes("API key")) {
        console.error("Your API key is invalid or has expired.");
    } else if (error.message.includes("404")) {
        console.error("Model not found. Your API key likely belongs to a project where the Generative Language API is not enabled.");
    }
  }
}

listModels();
