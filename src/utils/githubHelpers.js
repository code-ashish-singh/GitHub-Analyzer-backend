// src/utils/githubHelpers.js
// -----------------------------------------------------------------------------
// Small, pure helper functions used to process raw GitHub API data.
// Keeping these separate from the service/controller logic makes them
// easy to test and reuse.
// -----------------------------------------------------------------------------

/**
 * Calculates how many years (and months) old a GitHub account is.
 * @param {string} createdAt - ISO date string from GitHub (e.g. "2011-01-25T18:44:36Z")
 * @returns {string} Human-readable account age, e.g. "13 years, 4 months"
 */
export const calculateAccountAge = (createdAt) => {
  const createdDate = new Date(createdAt);
  const now = new Date();

  let years = now.getFullYear() - createdDate.getFullYear();
  let months = now.getMonth() - createdDate.getMonth();

  // If the month difference is negative, borrow a year
  if (months < 0) {
    years -= 1;
    months += 12;
  }

  return `${years} years, ${months} months`;
};

/**
 * Sums up a numeric field (like stargazers_count) across all repos.
 * @param {Array} repos - List of repository objects from GitHub API
 * @param {string} field - The field name to sum (e.g. "stargazers_count")
 * @returns {number} Total sum
 */
export const sumRepoField = (repos, field) => {
  return repos.reduce((total, repo) => total + (repo[field] || 0), 0);
};

/**
 * Sorts repositories by stars (descending) and returns the top N.
 * Used to decide which repos are "important enough" to fetch
 * languages/readme for, instead of doing it for every single repo
 * (which would be slow and waste API rate limits).
 * @param {Array} repos - List of repository objects
 * @param {number} count - How many top repos to return
 * @returns {Array} Top N repositories
 */
export const getTopRepositories = (repos, count = 5) => {
  return [...repos]
    .sort((a, b) => b.stargazers_count - a.stargazers_count)
    .slice(0, count);
};

/**
 * Combines language data from multiple repositories into a single
 * ranked list of "top languages" used across the profile.
 * @param {Array} languagesPerRepo - Array of language objects, e.g.
 *   [{ JavaScript: 1200, CSS: 300 }, { Python: 800 }]
 * @returns {Array} Sorted array like [{ name: "JavaScript", bytes: 1200 }, ...]
 */
export const aggregateTopLanguages = (languagesPerRepo) => {
  const languageTotals = {};

  // Add up bytes of code per language across all repos
  languagesPerRepo.forEach((repoLanguages) => {
    Object.entries(repoLanguages).forEach(([language, bytes]) => {
      languageTotals[language] = (languageTotals[language] || 0) + bytes;
    });
  });

  // Convert to a sorted array (most used language first)
  return Object.entries(languageTotals)
    .map(([name, bytes]) => ({ name, bytes }))
    .sort((a, b) => b.bytes - a.bytes);
};

/**
 * Finds the most recently updated repositories to represent "recent activity".
 * @param {Array} repos - List of repository objects
 * @param {number} count - How many recent repos to return
 * @returns {Array} Repos sorted by last updated date (most recent first)
 */
export const getRecentActivity = (repos, count = 5) => {
  return [...repos]
    .sort((a, b) => new Date(b.pushed_at) - new Date(a.pushed_at))
    .slice(0, count)
    .map((repo) => ({
      name: repo.name,
      updatedAt: repo.pushed_at,
      description: repo.description,
    }));
};
