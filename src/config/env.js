// src/config/env.js
// -----------------------------------------------------------------------------
// This file centralizes access to all environment variables.
// Instead of calling `process.env.SOMETHING` all over the codebase,
// every other file imports values from here. This makes it easy to:
//   1. See all required config in one place
//   2. Validate that required variables exist before the server starts
//   3. Swap/add new env variables (e.g. new AI provider keys) without
//      hunting through the whole codebase
// -----------------------------------------------------------------------------

import dotenv from "dotenv";

// Load variables from the .env file into process.env
dotenv.config();

// Export a single config object that the rest of the app uses
export const env = {
  // Port the Express server will listen on
  PORT: process.env.PORT || 5000,

  // Node environment (development | production | test)
  NODE_ENV: process.env.NODE_ENV || "development",

  // GitHub Personal Access Token (optional but recommended).
  // Without it, GitHub's API rate limit is very low (60 requests/hour).
  // With a token, the limit jumps to 5000 requests/hour.
  GITHUB_TOKEN: process.env.GITHUB_TOKEN || null,
  NVIDIA_API_KEY: process.env.NVIDIA_API_KEY || null,

  // TODO: When you add more AI providers, register their keys here too.
  // Example:
  // GROQ_API_KEY: process.env.GROQ_API_KEY || null,
  // OPENAI_API_KEY: process.env.OPENAI_API_KEY || null,
  // DEEPSEEK_API_KEY: process.env.DEEPSEEK_API_KEY || null,
  // NVIDIA_NIM_API_KEY: process.env.NVIDIA_NIM_API_KEY || null,

  // TODO: When MongoDB caching is added, store the connection string here.
  // MONGODB_URI: process.env.MONGODB_URI || null,
};

/**
 * Simple startup check that warns (but does not crash) the server
 * if optional-but-important environment variables are missing.
 * This keeps the app "beginner friendly" — it still runs without
 * a Gemini key, it just won't be able to generate AI analysis.
 */
export const validateEnv = () => {
  if (!env.NVIDIA_API_KEY) {
    console.warn(
      "⚠️  WARNING: NVIDIA_API_KEY is not set. AI analysis will return a placeholder response."
    );
  }

  if (!env.GITHUB_TOKEN) {
    console.warn(
      "⚠️  WARNING: GITHUB_TOKEN is not set. GitHub API requests will be rate-limited to 60/hour."
    );
  }
};
