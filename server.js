// server.js
// -----------------------------------------------------------------------------
// This is the entry point of the application. Its only job is to:
//   1. Validate environment variables
//   2. Start the Express server (defined in src/app.js) listening on a port
//
// Run with: npm start  (or npm run dev for auto-restart during development)
// -----------------------------------------------------------------------------

import app from "./src/app.js";
import { env, validateEnv } from "./src/config/env.js";

// Warn about any missing optional environment variables (doesn't crash the app)
validateEnv();

app.listen(env.PORT, () => {
  console.log(`🚀 Server running on http://localhost:${env.PORT}`);
  console.log(`📦 Environment: ${env.NODE_ENV}`);
});
