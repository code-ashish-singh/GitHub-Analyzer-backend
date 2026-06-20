// src/routes/analyzeRoutes.js
// -----------------------------------------------------------------------------
// Defines all routes related to GitHub profile analysis.
// Routes simply map an HTTP method + path to a controller function.
// -----------------------------------------------------------------------------

import express from "express";
import { analyzeProfile } from "../controllers/analyzeController.js";

const router = express.Router();

// POST /api/analyze  ->  runs the full GitHub profile analysis flow
router.post("/analyze", analyzeProfile);

// TODO: Add GET /api/analyze/:username/history here once MongoDB caching
// is implemented, to let users view previously generated analyses.

export default router;
