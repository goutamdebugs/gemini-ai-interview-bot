require('dotenv').config();

async function listAvailableModels() {
    const apiKey = process.env.GEMINI_API_KEY;
    const url = `https://generativelanguage.googleapis.com/v1beta/models?key=${apiKey}`;

    console.log("Asking Google for available models list...");

    try {
        const response = await fetch(url);
        const data = await response.json();

        if (data.models) {
            console.log("\nSUCCESS! Found available models:");
            console.log("-----------------------------------");
            data.models.forEach(model => {
                // Only show models that support the 'generateContent' method
                if (model.supportedGenerationMethods.includes("generateContent")) {
                    console.log(`Model Name: ${model.name.replace('models/', '')}`);
                }
            });
            console.log("-----------------------------------");
            console.log("Choose any one model name from the list above.");
        } else {
            console.log("\nNO MODELS FOUND!");
            console.log("Reason:", JSON.stringify(data, null, 2));
            console.log("\nSolution: Go to your Google Cloud Console and manually enable the 'Generative Language API'.");
        }
    } catch (error) {
        console.error("Network Error:", error.message);
    }
}

listAvailableModels();
