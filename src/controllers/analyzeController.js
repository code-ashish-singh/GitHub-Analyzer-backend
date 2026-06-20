// src/controllers/analyzeController.js
// -----------------------------------------------------------------------------
// Controllers handle the HTTP layer: reading the request, calling the
// right services in the right order, and sending back a response.
// Controllers should NOT contain business logic themselves — they just
// coordinate calls to services (githubService, summaryService, aiService).
// -----------------------------------------------------------------------------

import {
  fetchGitHubProfile,
  fetchGitHubRepos,
  fetchTopRepoDetails,
} from "../services/githubService.js";
import { buildProfileSummary } from "../services/summaryService.js";
import { generateAnalysis } from "../services/aiService.js";

/**
 * POST /api/analyze
 * Request body: { "username": "octocat" }
 * Response body: { success, profile, summary, analysis }
 */
export const analyzeProfile = async (req, res) => {
  try {
    const { username } = req.body;

    // ---- Step 1: Validate input ----------------------------------------
    if (!username || typeof username !== "string" || !username.trim()) {
      return res.status(400).json({
        success: false,
        message: "A valid GitHub 'username' is required in the request body",
      });
    }

    const cleanUsername = username.trim();

    // ---- Step 2 & 3: Fetch profile and repos IN PARALLEL ----------------
    // Both requests are independent of each other, so we use Promise.all
    // to run them at the same time instead of one after another.
    // This cuts the total wait time roughly in half.
    const [profile, repos] = await Promise.all([
      fetchGitHubProfile(cleanUsername),
      fetchGitHubRepos(cleanUsername),
    ]);

    // ---- Step 4: Fetch languages + readme for top repositories ----------
    // (This function internally also uses Promise.all for parallel fetching)
    const topRepoDetails = await fetchTopRepoDetails(cleanUsername, repos);

    // ---- Step 5: Build the structured summary object --------------------
    const summary = buildProfileSummary(profile, repos, topRepoDetails);

    // ---- Step 6: Send summary to the AI service for analysis ------------
    const analysis = await generateAnalysis(summary);

    // ---- Step 7: Send the final response ---------------------------------
    return res.status(200).json({
      success: true,
      profile,
      summary,
      analysis,
    });
  } catch (error) {
    // Centralized error handling for this controller.
    // If the GitHub username wasn't found, send a 404; otherwise 500.
    const isNotFound = error.message.includes("not found");
    const statusCode = isNotFound ? 404 : 500;

    console.error("Error in analyzeProfile:", error.message);

    return res.status(statusCode).json({
      success: false,
      message: error.message || "Something went wrong while analyzing the profile",
    });
  }
};

// TODO: Add MongoDB caching here — check the database for a recent
// analysis of this username before re-fetching everything from GitHub
// and re-calling the AI service (which costs time + API quota).

// TODO: Add user authentication here — e.g. require a logged-in user
// (via JWT/session) before allowing access to this endpoint, and track
// usage per user for rate-limiting or billing purposes.
