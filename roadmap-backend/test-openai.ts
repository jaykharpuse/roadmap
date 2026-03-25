import dotenv from "dotenv";
import { OpenAI } from "openai";

// Load environment variables
dotenv.config();

const apiKey = process.env.OPENAI_API_KEY;

console.log("API Key loaded:", apiKey ? "✓ Yes" : "✗ No");
console.log("API Key starts with 'sk-':", apiKey?.startsWith("sk-") ? "✓ Yes" : "✗ No");
console.log("API Key length:", apiKey?.length);

if (!apiKey) {
  console.error("❌ ERROR: OPENAI_API_KEY is not set in .env file!");
  process.exit(1);
}

// Create OpenAI client
const client = new OpenAI({
  apiKey: apiKey,
});

// Test API call
async function testOpenAI() {
  try {
    console.log("\n📡 Testing OpenAI API connection...\n");
    
    const response = await client.chat.completions.create({
      model: "gpt-4-turbo-preview",
      messages: [
        {
          role: "system",
          content: "You are a helpful assistant that responds with JSON.",
        },
        {
          role: "user",
          content: "Return a JSON object with keys 'test' and 'status'. Set status to 'success'.",
        },
      ],
      response_format: { type: "json_object" },
      max_tokens: 100,
    });

    console.log("✅ SUCCESS! OpenAI API is working correctly");
    console.log("\nResponse:", response.choices[0]?.message?.content);
  } catch (error: any) {
    console.error("❌ ERROR:", error.message);
    if (error.response) {
      console.error("Status:", error.response.status);
      console.error("Data:", error.response.data);
    }
    process.exit(1);
  }
}

testOpenAI();
