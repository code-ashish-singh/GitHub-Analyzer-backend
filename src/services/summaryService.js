// src/services/summaryService.js
// -----------------------------------------------------------------------------
// This service takes the RAW data we fetched from GitHub (profile, repos,
// top repo details) and transforms it into a clean, structured "summary"
// object. This summary is what gets shown to the user AND what gets sent
// to the AI service for analysis.
// -----------------------------------------------------------------------------

import {
  calculateAccountAge,
  sumRepoField,
  aggregateTopLanguages,
  getRecentActivity,
} from "../utils/githubHelpers.js";

/**
 * Builds the summary object described in the API spec:
 * { totalRepos, totalStars, totalForks, followers, following,
 *   accountAge, topLanguages, topRepositories, recentActivity }
 *
 * @param {Object} profile - Raw GitHub profile data (from /users/{username})
 * @param {Array} repos - Raw list of all repositories
 * @param {Array} topRepoDetails - Top repos enriched with languages + readme
 * @returns {Object} Clean summary object
 */
export const buildProfileSummary = (profile, repos, topRepoDetails) => {
  // Collect just the "languages" objects from the top repos so we can
  // combine them into one overall ranked list.
  const languagesPerRepo = topRepoDetails.map((repo) => repo.languages);

  const summary = {
    // Basic counts
    totalRepos: repos.length,
    totalStars: sumRepoField(repos, "stargazers_count"),
    totalForks: sumRepoField(repos, "forks_count"),

    // Social stats straight from the profile
    followers: profile.followers,
    following: profile.following,

    // How long the account has existed
    accountAge: calculateAccountAge(profile.created_at),

    // Most-used programming languages across top repos
    topLanguages: aggregateTopLanguages(languagesPerRepo),

    // Detailed info about top repositories (name, stars, languages, readme)
    topRepositories: topRepoDetails,

    // Most recently updated repos = "what they're working on now"
    recentActivity: getRecentActivity(repos, 5),
  };

  return summary;
};

// TODO: Add RAG (Retrieval-Augmented Generation) here in the future.
// For example: store README content + repo descriptions in a vector
// database, then retrieve the most relevant chunks before sending the
// summary to the AI service, so the AI gets better context for
// large profiles with many repositories.
