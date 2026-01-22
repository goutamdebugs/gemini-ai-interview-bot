require('dotenv').config();

async function testDirectAPI() {
    const apiKey = process.env.GEMINI_API_KEY;
    const model = "gemini-1.5-flash"; // মডেলের নাম

    console.log("📡 Connecting directly to Google API (No SDK)...");

    const url = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${apiKey}`;

    try {
        const response = await fetch(url, {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify({
                contents: [{
                    parts: [{ text: "Hello, are you online?" }]
                }]
            })
        });

        const data = await response.json();

        if (response.ok) {
            console.log("\n✅ SUCCESS! API is working directly!");
            console.log("🤖 Response:", data.candidates[0].content.parts[0].text);
            console.log("\n👉 সিদ্ধান্ত: SDK তে ঝামেলা আছে, কিন্তু API ঠিক আছে। আমরা এখন SDK ছাড়াই কোড লিখব।");
        } else {
            console.log("\n❌ FAILED via Direct API:");
            console.error(JSON.stringify(data, null, 2));
        }

    } catch (error) {
        console.error("Network Error:", error.message);
    }
}

testDirectAPI();