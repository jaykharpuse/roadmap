import axios from "axios";

const axiosInstance = axios.create({
  baseURL: "http://localhost:8000",
  withCredentials: true,
});

async function debugRoadmapGeneration() {
  try {
    console.log("🔐 Login Test...");
    const loginResponse = await axiosInstance.post("/user/sign-in", {
      email: "ap2730515@gmail.com",
      password: "Jay@2004",
    });

    console.log("✅ Login successful");
    
    console.log("\n📝 Cookies received:", Object.keys(loginResponse.headers["set-cookie"] || []));

    // Try with manual cookie set
    const cookies = loginResponse.headers["set-cookie"];
    if (cookies) {
      axiosInstance.defaults.headers.common['Cookie'] = cookies;
    }

    console.log("\n🚀 Testing /roadmap/generate endpoint...");

    // Make the request with shorter timeout
    const response = await axiosInstance.post(
      "/roadmap/generate",
      {
        userPrompt: "Learn React",
        isCommunityContributed: false,
      },
      { timeout: 10000 } // 10 second timeout
    );

    console.log("✅ Response received!");
    console.log("Status:", response.status);
    console.log("Data:", JSON.stringify(response.data, null, 2).slice(0, 800));

  } catch (error: any) {
    if (error.code === 'ECONNABORTED') {
      console.log("⏱️ Request timeout - AI is processing");
    } else if (error.response) {
      console.error("❌ Status:", error.response.status);
      console.error("Error:", error.response.data);
    } else if (error.request) {
      console.error("❌ No response:", error.message);
    } else {
      console.error("❌ Error:", error.message);
    }
  }
}

debugRoadmapGeneration();
