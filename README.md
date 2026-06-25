# GitHub Profile Analyzer Backend API

A powerful Node.js/Express backend service that fetches GitHub profile data, generates intelligent AI-powered analyses, and provides recruiter-style insights about developers.

## 📋 Table of Contents

- [Overview](#overview)
- [Tech Stack](#tech-stack)
- [Project Structure](#project-structure)
- [Prerequisites](#prerequisites)
- [Installation & Setup](#installation--setup)
- [Environment Variables](#environment-variables)
- [Running the Server](#running-the-server)
- [API Endpoints](#api-endpoints)
- [Architecture](#architecture)
- [Key Features](#key-features)
- [Development Guidelines](#development-guidelines)
- [Error Handling](#error-handling)
- [Performance Optimizations](#performance-optimizations)
- [Future Enhancements](#future-enhancements)
- [Contributing](#contributing)
- [License](#license)

---

## Overview

This backend API serves as the core engine for the GitHub Profile Analyzer SaaS platform. It:

- **Fetches GitHub Data**: Retrieves user profiles, repositories, languages, and README files from the GitHub REST API
- **Generates AI Analyses**: Uses AI services to create detailed, recruiter-style profile analyses
- **Builds Summaries**: Compiles technical summaries with top languages, repositories, and insights
- **Handles Requests**: Provides a clean REST API for frontend applications to consume analysis data

The API is built with Express.js, uses axios for HTTP requests, and follows a well-organized MVC architecture with a service layer for clean separation of concerns.

---

## Tech Stack

| Component | Technology |
|-----------|-----------|
| **Runtime** | Node.js (≥18.0.0) |
| **Framework** | Express.js 4.21.1 |
| **HTTP Client** | Axios 1.7.7 |
| **Middleware** | CORS, Express JSON Parser |
| **Environment Management** | dotenv 16.4.5 |
| **API Integration** | GitHub REST API v3 |
| **AI Integration** | AI Service (vendor-agnostic) |

---

## Project Structure

```
backend/
├── README.md                 # This file
├── package.json              # Project dependencies and scripts
├── server.js                 # Entry point: validates env & starts Express
└── src/
    ├── app.js                # Express app setup: middleware, routes, error handling
    ├── config/
    │   └── env.js            # Environment variable validation & configuration
    ├── controllers/
    │   └── analyzeController.js     # HTTP layer: request handling & response formatting
    ├── routes/
    │   └── analyzeRoutes.js         # Route definitions for analysis endpoints
    ├── services/
    │   ├── githubService.js         # GitHub API integration & data fetching
    │   ├── aiService.js             # AI analysis generation
    │   └── summaryService.js        # Profile summary building
    └── utils/
        └── githubHelpers.js         # GitHub-specific utility functions
```

### Architecture Layers

1. **Server Layer** (`server.js`): Application entry point
2. **Configuration Layer** (`config/`): Environment validation and setup
3. **Routing Layer** (`routes/`): HTTP endpoint definitions
4. **Controller Layer** (`controllers/`): Request/response handling and orchestration
5. **Service Layer** (`services/`): Business logic and external API calls
6. **Utility Layer** (`utils/`): Helper functions for specific domains

---

## Prerequisites

Before setting up the project, ensure you have:

- **Node.js** version 18.0.0 or higher
- **npm** or **yarn** package manager
- **GitHub Personal Access Token** (optional but recommended for higher API rate limits)
- **AI Service Credentials** (for analysis generation)

### Checking Node.js Installation

```bash
node --version
npm --version
```

---

## Installation & Setup

### 1. Clone or Navigate to the Backend Directory

```bash
cd backend
```

### 2. Install Dependencies

```bash
npm install
```

This will install all required packages as specified in `package.json`.

### 3. Configure Environment Variables

Create a `.env` file in the backend root directory:

```bash
cp .env.example .env   # If an example file exists
# OR manually create .env
```

See [Environment Variables](#environment-variables) section for detailed configuration.

### 4. Verify Installation

```bash
npm start
```

You should see:
```
🚀 Server running on http://localhost:5000
📦 Environment: development
```

---

## Environment Variables

Create a `.env` file in the `backend/` directory with the following variables:

```env
# Server Configuration
PORT=5000
NODE_ENV=development

# GitHub API Configuration
GITHUB_TOKEN=your_github_personal_access_token_here
# Get a token from: https://github.com/settings/tokens
# Recommended scopes: public_repo, read:user

# AI Service Configuration
# (Replace with your actual AI service credentials)
AI_API_KEY=your_ai_service_key_here
AI_API_URL=https://your-ai-service-endpoint.com
AI_MODEL=model_name_here
```

### How to Get a GitHub Token

1. Go to [GitHub Settings → Developer Settings → Personal access tokens](https://github.com/settings/tokens)
2. Click "Generate new token"
3. Select scopes: `public_repo`, `read:user`
4. Copy the token and add it to your `.env` file

**Benefits of Using a Token:**
- Increases rate limit from 60 to 5,000 requests/hour
- Allows fetching private repository data (with appropriate scopes)

---

## Running the Server

### Development Mode (with Auto-Restart)

```bash
npm run dev
```

This uses Node's `--watch` flag to automatically restart the server when files change.

### Production Mode

```bash
npm start
```

Starts the server without file watching for production deployments.

### Health Check

Once running, verify the API is working:

```bash
curl http://localhost:5000/
```

Expected response:
```json
{
  "success": true,
  "message": "GitHub Profile Analyzer API is running"
}
```

---

## API Endpoints

### 1. Health Check

**Endpoint:** `GET /`

**Description:** Verifies the API is running and healthy.

**Response:**
```json
{
  "success": true,
  "message": "GitHub Profile Analyzer API is running"
}
```

### 2. Analyze GitHub Profile

**Endpoint:** `POST /api/analyze`

**Description:** Analyzes a GitHub user profile and generates AI-powered insights.

**Request Body:**
```json
{
  "username": "octocat"
}
```

**Response:**
```json
{
  "success": true,
  "profile": {
    "login": "octocat",
    "id": 1,
    "avatar_url": "...",
    "public_repos": 8,
    "followers": 3938,
    "following": 9,
    "company": "@github",
    "location": "San Francisco",
    "bio": "...",
    "public_gists": 8,
    "created_at": "2011-01-25T18:44:36Z"
  },
  "summary": {
    "totalRepositories": 8,
    "publicRepositories": 8,
    "totalStars": 120,
    "totalForks": 200,
    "followers": 3938,
    "following": 9,
    "topLanguages": {
      "JavaScript": 5,
      "TypeScript": 2,
      "Python": 1
    },
    "topRepositories": [
      {
        "name": "Hello-World",
        "description": "My first repository on GitHub!",
        "url": "https://github.com/octocat/Hello-World",
        "stars": 80,
        "forks": 120,
        "languages": ["JavaScript"]
      }
    ]
  },
  "analysis": {
    "technicalSkills": [
      "JavaScript",
      "TypeScript",
      "Python",
      "REST APIs",
      "Git"
    ],
    "improvements": [
      "Contribute to open-source projects",
      "Improve documentation",
      "Add unit tests to repositories"
    ],
    "roadmap": [
      "Learn DevOps and containerization",
      "Explore cloud platforms"
    ],
    "hiringScore": 8.5
  }
}
```

**Error Response:**
```json
{
  "success": false,
  "message": "User not found on GitHub"
}
```

**Status Codes:**
| Code | Meaning |
|------|---------|
| 200 | Success |
| 400 | Invalid input (missing or invalid username) |
| 404 | GitHub user not found |
| 500 | Server error |

**Example Usage:**

```bash
curl -X POST http://localhost:5000/api/analyze \
  -H "Content-Type: application/json" \
  -d '{"username": "octocat"}'
```

---

## Architecture

### Data Flow

```
Request (POST /api/analyze)
    ↓
[Controller Layer]
  - Validate input
  - Orchestrate service calls
    ↓
[Service Layer]
  - GitHub Service: Fetch profile, repos, languages
  - Summary Service: Build structured summary
  - AI Service: Generate analysis
    ↓
[External APIs]
  - GitHub REST API
  - AI Service Provider
    ↓
Response (JSON)
```

### Service Responsibilities

#### GitHub Service (`githubService.js`)
- Fetches user profile information
- Retrieves all public repositories
- Fetches repository languages and README files
- Handles GitHub API rate limiting and errors

#### Summary Service (`summaryService.js`)
- Aggregates GitHub data into a structured format
- Calculates statistics (total stars, forks, etc.)
- Identifies top programming languages
- Ranks top repositories

#### AI Service (`aiService.js`)
- Generates recruiter-style profile analysis
- Identifies technical skills
- Suggests improvements
- Provides career roadmap recommendations
- Calculates hiring score

---

## Key Features

### ✅ Parallel Data Fetching
- Uses `Promise.all()` to fetch profile and repos simultaneously
- Reduces total request time by ~50%

### ✅ Error Handling
- Graceful error responses for invalid users
- HTTP status codes for different error scenarios
- Detailed error messages for debugging

### ✅ CORS Support
- Allows cross-origin requests from frontend apps
- Configurable for production deployments

### ✅ Environment Configuration
- Secure credential management with `.env`
- Different configurations for dev/prod environments
- Validation of required environment variables

### ✅ Rate Limit Optimization
- GitHub token support for higher rate limits
- Efficient API usage with minimal requests

### ✅ Clean Architecture
- Clear separation of concerns (MVC + Service Layer)
- Easy to test and maintain
- Scalable for future features

---

## Development Guidelines

### Code Organization Principles

1. **Controllers** handle HTTP only
   - Request validation
   - Calling services
   - Response formatting

2. **Services** contain business logic
   - Never access `req` or `res` directly
   - Can be tested independently
   - Reusable across multiple controllers

3. **Utils** provide helper functions
   - Pure functions (no side effects)
   - Specific to a domain
   - Tested independently

### Adding a New Endpoint

Example: Add a `GET /api/analyze/:username/history` endpoint

1. **Create a new controller method** in `analyzeController.js`:
   ```javascript
   export const getAnalysisHistory = async (req, res) => {
     // Fetch from database
     // Return response
   };
   ```

2. **Add the route** in `analyzeRoutes.js`:
   ```javascript
   router.get("/:username/history", getAnalysisHistory);
   ```

3. **Add necessary service** if required (e.g., database queries)

### Error Handling Best Practices

```javascript
try {
  const data = await someService();
  res.json(data);
} catch (error) {
  if (error.response?.status === 404) {
    return res.status(404).json({
      success: false,
      message: "Resource not found"
    });
  }
  res.status(500).json({
    success: false,
    message: "Internal server error"
  });
}
```

---

## Error Handling

The API implements comprehensive error handling:

### Error Response Format

```json
{
  "success": false,
  "message": "Descriptive error message"
}
```

### Common Error Scenarios

| Scenario | Status | Message |
|----------|--------|---------|
| Missing username | 400 | "A valid GitHub 'username' is required" |
| Invalid username format | 400 | "A valid GitHub 'username' is required" |
| User not found on GitHub | 404 | "User not found on GitHub" |
| GitHub API rate limited | 429 | "GitHub API rate limit exceeded" |
| Server error | 500 | "Internal server error" |

### Global Error Handler

The Express global error handler (in `app.js`) catches:
- Unhandled promise rejections
- Synchronous errors
- Any errors passed via `next(error)`

---

## Performance Optimizations

### 1. Parallel API Requests
```javascript
const [profile, repos] = await Promise.all([
  fetchGitHubProfile(username),
  fetchGitHubRepos(username)
]);
```

### 2. Axios Instance Reuse
- Created once with default configuration
- Reduces overhead for multiple requests

### 3. GitHub Token Support
- Increases rate limit from 60 to 5,000 requests/hour
- Included in environment configuration

### 4. Efficient Repository Selection
- Filters to top repositories by stars
- Reduces unnecessary API calls
- Faster processing

---

## Future Enhancements

### Planned Features (TODO)

```javascript
// 1. Database Integration
// - MongoDB connection for caching analysis results
// - User account system
// - Analysis history storage

// 2. Authentication
// - JWT-based authentication
// - User session management
// - Protected routes

// 3. Caching
// - Redis for profile caching
// - Reduced GitHub API calls
// - Improved response times

// 4. Additional Endpoints
// - GET /api/analyze/:username/history
// - GET /api/trending
// - POST /api/compare
// - GET /api/stats

// 5. Advanced Analytics
// - Language trend analysis
// - Activity timeline
// - Repository recommendations
// - Skill benchmarking
```

---

## Contributing

### How to Contribute

1. **Fork** the repository
2. **Create** a feature branch: `git checkout -b feature/your-feature-name`
3. **Make** your changes following the code guidelines
4. **Test** your changes thoroughly
5. **Commit** with clear messages: `git commit -m "Add: description of changes"`
6. **Push** to your branch: `git push origin feature/your-feature-name`
7. **Create** a Pull Request with a detailed description

### Code Standards

- Follow Express.js best practices
- Use descriptive variable and function names
- Add comments for complex logic
- Keep functions focused and testable
- Handle errors explicitly

---

## License

MIT License - Feel free to use this project for personal or commercial purposes.

---

## Support

For questions or issues:

- **GitHub Issues**: Report bugs and request features
- **Email**: Contact the development team
- **Documentation**: Check the inline code comments for detailed explanations

---

## Deployment

### Deploying to Production

#### Option 1: Heroku
```bash
heroku create your-app-name
git push heroku main
heroku config:set GITHUB_TOKEN=your_token
heroku open
```

#### Option 2: Railway / Render
1. Connect your GitHub repository
2. Add environment variables in the dashboard
3. Deploy automatically on push

#### Option 3: Docker
```bash
docker build -t github-analyzer-backend .
docker run -p 5000:5000 -e GITHUB_TOKEN=xxx github-analyzer-backend
```

### Environment Setup for Production

Update `.env` for production:
```env
NODE_ENV=production
PORT=5000
GITHUB_TOKEN=your_production_token
AI_API_KEY=your_production_key
```

---

**Last Updated**: 2024
**Maintained By**: Senior Full Stack Development Team
