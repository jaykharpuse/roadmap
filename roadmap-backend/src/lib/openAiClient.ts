import dotenv from "dotenv";
import { OpenAI } from "openai";

// Load environment variables first
dotenv.config();

// Use environment variable for API key. DO NOT commit secrets to the repository.
const apiKey = process.env.OPENAI_API_KEY;

if (!apiKey) {
  console.error("⚠️  WARNING: OPENAI_API_KEY is not set in environment variables!");
}

export const openai = new OpenAI({
  apiKey: apiKey || "",
});
