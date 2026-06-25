import axios from "axios";
import { GoogleGenAI } from "@google/genai";
import { env } from "../config/env.js";

const NVIDIA_API_URL = "https://integrate.api.nvidia.com/v1/chat/completions";

const callGemini = async (prompt) => {
  const genAI = new GoogleGenAI({ apiKey: env.GEMINI_API_KEY });
  const response = await genAI.models.generateContent({
    model: "gemini-2.5-flash",
    contents: prompt,
  });
  const text = response.text;
  if (!text) throw new Error("Gemini returned empty response");
  return text;
};

const callModel = async (model, prompt) => {
  const response = await axios.post(
    NVIDIA_API_URL,
    {
      model,
      messages: [{ role: "user", content: prompt }],
      max_tokens: 1024,
      temperature: 0.7,
      stream: false,
    },
    {
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${env.NVIDIA_API_KEY}`,
        Accept: "application/json",
      },
      timeout: 60000,
    }
  );

  const text = response.data?.choices?.[0]?.message?.content;
  if (!text) throw new Error(`${model} returned empty response`);
  return text;
};

const prompts = {
  technicalSkills: (summary) => `You are a senior technical recruiter. Analyze this GitHub profile and return ONLY valid JSON.

GitHub Summary: ${JSON.stringify(summary)}

Return exactly this JSON structure:
{
  "languages": ["<actual languages from profile>"],
  "frameworks": ["<actual frameworks/tools detected>"],
  "careerLevel": "<Junior|Mid|Senior|Staff based on actual profile>",
  "careerReason": "<specific one line reason based on this profile>",
  "score": <number 1-10>
}`,

  improvements: (summary) => `You are a code quality expert. Analyze this GitHub profile and return ONLY valid JSON.

GitHub Summary: ${JSON.stringify(summary)}

Return exactly this JSON structure:
{
  "missing": ["<actual missing skill 1>", "<actual missing skill 2>", "<actual missing skill 3>"],
  "improvements": ["<specific improvement 1>", "<specific improvement 2>", "<specific improvement 3>"],
  "strengths": ["<actual strength 1>", "<actual strength 2>", "<actual strength 3>"]
}`,

  roadmap: (summary) => `You are a career coach for software engineers. Analyze this GitHub profile and return ONLY valid JSON.

GitHub Summary: ${JSON.stringify(summary)}

Return exactly this JSON:
{"shortTerm":["<specific action 1>","<specific action 2>","<specific action 3>"],"longTerm":["<specific goal 1>","<specific goal 2>"],"topSkillToLearn":"<most important skill for this developer>","recommendedProjects":["<specific project idea 1>","<specific project idea 2>"]}`,

  hiringScore: (summary) => `You are an experienced hiring manager at a top tech company. Analyze this GitHub profile and return ONLY valid JSON.

GitHub Summary: ${JSON.stringify(summary)}

Return exactly this JSON structure:
{
  "score": <number 1-10 based on actual profile>,
  "outOf": 10,
  "verdict": "<a specific, personalized one-line verdict about this developer>",
  "positives": ["<specific positive 1>", "<specific positive 2>"],
  "concerns": ["<specific concern 1>", "<specific concern 2>"]
}`,
};

const safeCall = async (model, prompt, fallback) => {
  try {
    const text = await callModel(model, prompt);
    const jsonMatch = text.match(/\{[\s\S]*\}/);
    if (!jsonMatch) return fallback;
    return JSON.parse(jsonMatch[0]);
  } catch (e) {
    console.warn(`⚠️ ${model} failed: ${e.message}`);
    return fallback;
  }
};

const safeCallGemini = async (prompt, fallback) => {
  try {
    const text = await callGemini(prompt);
    const jsonMatch = text.match(/\{[\s\S]*\}/);
    if (!jsonMatch) return fallback;
    return JSON.parse(jsonMatch[0]);
  } catch (e) {
    console.warn(`⚠️ Gemini failed: ${e.message}`);
    return fallback;
  }
};

export const generateAnalysis = async (summary) => {
  if (!env.NVIDIA_API_KEY) {
    return null;
  }

  console.log("🚀 Running parallel AI analysis...");

  const [technicalSkills, improvements, roadmap, hiringScore] = await Promise.all([
    safeCall("meta/llama-3.3-70b-instruct", prompts.technicalSkills(summary), {}),
    safeCall("meta/llama-3.3-70b-instruct", prompts.improvements(summary), {}),
    safeCall("nvidia/llama-3.3-nemotron-super-49b-v1", prompts.roadmap(summary), {}),
    safeCall("meta/llama-3.1-8b-instruct", prompts.hiringScore(summary), {}),
  ]);

  console.log("✅ AI analysis complete");

  return { technicalSkills, improvements, roadmap, hiringScore };
};
