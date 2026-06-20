// src/app.js
// -----------------------------------------------------------------------------
// This file configures the Express application: middleware, routes, and
// global error handling. It does NOT start the server — that happens in
// server.js. Separating "app setup" from "server start" makes it easier
// to write tests later (you can import the app without starting a real port).
// -----------------------------------------------------------------------------

import express from "express";
import cors from "cors";
import analyzeRoutes from "./routes/analyzeRoutes.js";

const app = express();

// ---- Global Middleware ------------------------------------------------------

// Allow cross-origin requests so a separate frontend (e.g. React app on
// a different port/domain) can call this API.
app.use(cors());

// Parse incoming JSON request bodies into req.body
app.use(express.json());

// ---- Routes -------------------------------------------------------------

// Simple health check route — useful for confirming the server is alive,
// and for deployment platforms (e.g. Render, Railway) that ping a health URL.
app.get("/", (req, res) => {
  res.status(200).json({
    success: true,
    message: "GitHub Profile Analyzer API is running",
  });
});

// All analyze-related routes are prefixed with /api
app.use("/api", analyzeRoutes);

// ---- 404 Handler ----------------------------------------------------------
// Runs if no route above matched the request.
app.use((req, res) => {
  res.status(404).json({
    success: false,
    message: `Route not found: ${req.method} ${req.originalUrl}`,
  });
});

// ---- Global Error Handler ---------------------------------------------------
// Catches any error passed via next(error), or thrown in synchronous code.
// Most of our async errors are already caught inside the controller's
// try/catch, but this is a safety net for anything unexpected.
app.use((err, req, res, next) => {
  console.error("Unhandled error:", err.stack);
  res.status(500).json({
    success: false,
    message: "Internal server error",
  });
});

// TODO: Add MongoDB connection middleware/setup here once a database is added
// (e.g. connect to MongoDB before the app starts handling requests).

// TODO: Add authentication middleware here (e.g. JWT verification) once
// user accounts are introduced, so protected routes can check req.user.

export default app;
