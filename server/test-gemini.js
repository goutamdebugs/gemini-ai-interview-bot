require('dotenv').config();
const { GoogleGenerativeAI } = require("@google/generative-ai");

async function testConnection() {
  console.log("⏳ Testing Gemini Connection...");
  
  
  if (!process.env.GEMINI_API_KEY) {
    console.error("❌ Error: .env ফাইল থেকে API Key পাওয়া যাচ্ছে না!");
    return;
  }
  console.log(`🔑 Key loaded: ${process.env.GEMINI_API_KEY.substring(0, 5)}...`);

  try {
    const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
   
    const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" }, { apiVersion: 'v1beta' });

    const result = await model.generateContent("Hello, are you working?");
    const response = await result.response;
    
    console.log("\n✅ SUCCESS! Google Gemini is Working!");
    console.log("🤖 Response:", response.text());
    
  } catch (error) {
    console.error("\n❌ FAILED:");
    console.error(error.message);
  }
}

testConnection();