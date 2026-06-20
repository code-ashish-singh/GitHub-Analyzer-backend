// src/services/githubService.js
// -----------------------------------------------------------------------------
// This service is responsible for ALL communication with the GitHub REST API.
// The controller never calls axios/GitHub directly — it always goes through
// these functions. This separation (MVC "Service Layer") keeps our code
// organized: controllers handle HTTP requests/responses, services handle
// business logic / external API calls.
// -----------------------------------------------------------------------------

import axios from "axios";
import { env } from "../config/env.js";
import { getTopRepositories } from "../utils/githubHelpers.js";

const GITHUB_API_BASE_URL = "https://api.github.com";

// Create a reusable axios instance pre-configured for GitHub's API.
// This avoids repeating the base URL and headers in every function.
const githubApi = axios.create({
  baseURL: GITHUB_API_BASE_URL,
  headers: {
    Accept: "application/vnd.github+json",
    // If a GitHub token is provided, attach it so we get a much higher
    // rate limit (5000 requests/hour instead of 60).
    ...(env.GITHUB_TOKEN && { Authorization: `Bearer ${env.GITHUB_TOKEN}` }),
  },
});

/**
 * Fetches the main GitHub profile (user) data.
 * Endpoint: GET /users/{username}
 * @param {string} username - GitHub username to look up
 * @returns {Promise<Object>} The user's profile data
 */
export const fetchGitHubProfile = async (username) => {
  try {
    const response = await githubApi.get(`/users/${username}`);
    return response.data;
  } catch (error) {
    // If GitHub returns 404, the username doesn't exist.
    if (error.response?.status === 404) {
      throw new Error(`GitHub user "${username}" not found`);
    }
    // Any other error (network issue, rate limit, etc.)
    throw new Error(`Failed to fetch GitHub profile: ${error.message}`);
  }
};

/**
 * Fetches all public repositories for a user.
 * Endpoint: GET /users/{username}/repos
 * @param {string} username - GitHub username
 * @returns {Promise<Array>} List of repository objects
 */
export const fetchGitHubRepos = async (username) => {
  try {
    const response = await githubApi.get(`/users/${username}/repos`, {
      params: {
        per_page: 100, // Fetch up to 100 repos in one call
        sort: "updated", // Most recently updated first
      },
    });
    return response.data;
  } catch (error) {
    throw new Error(`Failed to fetch repositories: ${error.message}`);
  }
};

/**
 * Fetches the language breakdown for a single repository.
 * Endpoint: GET /repos/{owner}/{repo}/languages
 * Example response: { JavaScript: 12030, CSS: 4521 }
 * @param {string} owner - Repository owner (username)
 * @param {string} repoName - Repository name
 * @returns {Promise<Object>} Language byte-count map
 */
export const fetchRepoLanguages = async (owner, repoName) => {
  try {
    const response = await githubApi.get(`/repos/${owner}/${repoName}/languages`);
    return response.data;
  } catch (error) {
    // Don't crash the whole analysis if one repo's languages fail to load.
    // Just return an empty object so Promise.all doesn't reject everything.
    console.warn(`Could not fetch languages for ${repoName}: ${error.message}`);
    return {};
  }
};

/**
 * Fetches the decoded README content for a single repository.
 * Endpoint: GET /repos/{owner}/{repo}/readme
 * GitHub returns the README as base64-encoded content, so we decode it.
 * @param {string} owner - Repository owner (username)
 * @param {string} repoName - Repository name
 * @returns {Promise<string>} Decoded README text (or empty string if none)
 */
export const fetchRepoReadme = async (owner, repoName) => {
  try {
    const response = await githubApi.get(`/repos/${owner}/${repoName}/readme`);
    const base64Content = response.data.content;

    // Decode base64 -> plain text
    const decodedContent = Buffer.from(base64Content, "base64").toString("utf-8");
    return decodedContent;
  } catch (error) {
    // Many repos simply don't have a README — that's fine, not a real error.
    return "";
  }
};

/**
 * Fetches languages + readme for the TOP repositories (by stars) in parallel.
 * We don't do this for every single repo because that could mean hundreds
 * of extra API calls — instead we focus on the repos that matter most.
 * @param {string} username - GitHub username (repo owner)
 * @param {Array} repos - Full list of repositories
 * @returns {Promise<Array>} Top repos enriched with languages + readme
 */
export const fetchTopRepoDetails = async (username, repos) => {
  const topRepos = getTopRepositories(repos, 5);

  // Use Promise.all to fetch languages + readme for all top repos
  // IN PARALLEL instead of one-by-one (much faster).
  const detailedRepos = await Promise.all(
    topRepos.map(async (repo) => {
      const [languages, readme] = await Promise.all([
        fetchRepoLanguages(username, repo.name),
        fetchRepoReadme(username, repo.name),
      ]);

      return {
        name: repo.name,
        description: repo.description,
        stars: repo.stargazers_count,
        forks: repo.forks_count,
        url: repo.html_url,
        languages,
        // Trim README to a reasonable length so we don't send huge
        // amounts of text to the AI service later.
        readmePreview: readme.slice(0, 500),
      };
    })
  );

  return detailedRepos;
};

// TODO: Add MongoDB caching here — e.g. before calling GitHub API,
// check if we already fetched this user's profile recently (within last
// hour/day) and return the cached version instead of hitting GitHub again.
// This would save API rate limit and speed up repeated requests.
