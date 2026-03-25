import dotenv from "dotenv";

// Load from .env file
dotenv.config();

console.log("🔍 Environment Variables Check:\n");
console.log("OPENAI_API_KEY exists:", !!process.env.OPENAI_API_KEY);
console.log("OPENAI_API_KEY length:", process.env.OPENAI_API_KEY?.length);
console.log("OPENAI_API_KEY starts with 'sk-':", process.env.OPENAI_API_KEY?.startsWith("sk-"));
console.log("First 30 chars:", process.env.OPENAI_API_KEY?.slice(0, 30));

console.log("\n📍 .env file path:", __dirname + "/../.env");

import fs from "fs";
console.log("\nChecking .env file exists:", fs.existsSync(__dirname + "/../../.env"));
