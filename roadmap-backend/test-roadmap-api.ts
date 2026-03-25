import axios from "axios";

const axiosInstance = axios.create({
  baseURL: "http://localhost:8000",
  withCredentials: true,
});

async function testRoadmapAPI() {
  try {
    console.log("🔐 Step 1: Logging in...\n");

    // Login
    const loginResponse = await axiosInstance.post("/user/sign-in", {
      email: "ap2730515@gmail.com",
      password: "Jay@2004",
    });

    console.log("✅ Login successful!");
    console.log("Token received:", loginResponse.data?.token?.slice(0, 50) + "...");

    // Wait a moment for cookies to be set
    await new Promise(resolve => setTimeout(resolve, 500));

    console.log("\n🚀 Step 2: Generating AI Roadmap...\n");

    // Generate roadmap with authenticated session
    const roadmapResponse = await axiosInstance.post(
      "/roadmap/generate",
      {
        userPrompt: "I want to learn Python from beginner to advanced level for data science",
        isCommunityContributed: false,
      }
    );

    console.log("✅ Roadmap generated successfully!");
    console.log("\nRoadmap Details:");
    console.log("- Title:", roadmapResponse.data?.title);
    console.log("- Category:", roadmapResponse.data?.category);
    console.log("- Difficulty:", roadmapResponse.data?.difficulty);
    console.log("- Nodes:", roadmapResponse.data?.nodes?.length);
    console.log("\nFull Response:", JSON.stringify(roadmapResponse.data, null, 2).slice(0, 500));

  } catch (error: any) {
    console.error("❌ Error occurred:");
    if (error.response) {
      console.error("Status:", error.response.status);
      console.error("Data:", JSON.stringify(error.response.data, null, 2));
    } else {
      console.error("Message:", error.message);
    }
  }
}

testRoadmapAPI();
