require('dotenv').config();
const { GoogleGenerativeAI } = require("@google/generative-ai");

const candidateModels = [
  "gemini-1.5-flash",
  "gemini-1.5-flash-001",
  "gemini-1.5-flash-latest",
  "gemini-pro",
  "gemini-1.0-pro",
  "gemini-1.5-pro"
];

async function findWorkingModel() {
  console.log("Scanning for working models with your API Key...");
  const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
  
  for (const modelName of candidateModels) {
    process.stdout.write(`Testing '${modelName}'... `);
    try {
      const model = genAI.getGenerativeModel({ model: modelName });
      const result = await model.generateContent("Hi");
      const response = await result.response;
      console.log("SUCCESS!");
      console.log(`\nGREAT NEWS! Please use '${modelName}' in your server/config/gemini.js file.`);
      return; // Stop execution once a working model is found
    } catch (error) {
      if (error.message.includes("404")) {
        console.log("Not Found (404)");
      } else {
        console.log(`Error: ${error.message.split('[')[0]}`); // Short error message
      }
    }
  }
  
  console.log("\nNo working model found. Please verify your API Key permissions in Google AI Studio.");
}

findWorkingModel();
