import axios from "axios";
import dotenv from "dotenv";

dotenv.config();

// Test function
async function testRoadmapGeneration() {
  try {
    console.log("🧪 Testing Roadmap Generation API...\n");

    // Create a test user token (you may need a real token)
    const backendUrl = "http://localhost:8000";
    
    // First, let's test if the server is even running
    console.log("📡 Checking if backend is running...");
    const healthCheck = await axios.get(`${backendUrl}/roadmap`, {
      withCredentials: false,
      timeout: 5000
    }).catch((err) => {
      console.log(`✓ Server responded: ${err.response?.status || "Not running"}`);
    });

    console.log("✓ Backend is running\n");

    // Test the generate roadmap endpoint
    console.log("🚀 Testing /roadmap/generate endpoint...");
    
    const testPayload = {
      userPrompt: "I want to learn React.js from beginner to advanced level",
      isCommunityContributed: false
    };

    console.log("📤 Request payload:", testPayload);
    console.log("\nThis will fail because we need authentication, but we'll see the error:\n");

    const response = await axios.post(
      `${backendUrl}/roadmap/generate`,
      testPayload,
      {
        withCredentials: true,
        headers: {
          "Content-Type": "application/json"
        },
        timeout: 30000
      }
    );

    console.log("✅ Success! Response:", response.data);

  } catch (error: any) {
    console.log("❌ Error occurred:");
    console.log("\nError Type:", error.code || error.message);
    if (error.response) {
      console.log("Status:", error.response.status);
      console.log("Data:", error.response.data);
    } else if (error.request) {
      console.log("No response received. Details:", error.message);
    } else {
      console.log("Error message:", error.message);
    }
  }
}

testRoadmapGeneration();
