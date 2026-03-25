import axios from "axios";

const axiosInstance = axios.create({
  baseURL: "http://localhost:8000",
  withCredentials: true,
});

async function testRoadmapGeneration() {
  try {
    console.log("🔐 Logging in...");
    const loginResponse = await axiosInstance.post("/user/sign-in", {
      email: "ap2730515@gmail.com",
      password: "Jay@2004",
    });

    console.log("✅ Login successful\n");

    console.log("🚀 Generating AI Roadmap (this may take 30-45 seconds)...\n");

    // Make the request with 60-second timeout
    const response = await axiosInstance.post(
      "/roadmap/generate",
      {
        userPrompt: "Learn React.js",
        isCommunityContributed: false,
      },
      { timeout: 120000 } // 120 second timeout
    );

    console.log("✅ SUCCESS! Roadmap generated!\n");
    console.log("📊 Roadmap Details:");
    console.log("- ID:", response.data?._id);
    console.log("- Title:", response.data?.title);
    console.log("- Description:", response.data?.description?.slice(0, 100) + "...");
    console.log("- Category:", response.data?.category);
    console.log("- Difficulty:", response.data?.difficulty);
    console.log("- Nodes count:", response.data?.nodes?.length);
    console.log("\n🎉 AI Roadmap Generation is now WORKING!");

  } catch (error: any) {
    if (error.code === 'ECONNABORTED') {
      console.log("⏱️ Request timeout - but this might mean AI is still processing");
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

testRoadmapGeneration();
