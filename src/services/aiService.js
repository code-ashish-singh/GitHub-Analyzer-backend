import axios from "axios";
import { env } from "../config/env.js";

const NVIDIA_API_URL = "https://integrate.api.nvidia.com/v1/chat/completions";

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
  technicalSkills: (summary) => `
You are a senior technical recruiter. Analyze this GitHub profile and return ONLY a JSON object.

GitHub Summary: ${JSON.stringify(summary)}

Return this exact JSON structure (no markdown, no extra text):
{
  "languages": ["lang1", "lang2"],
  "frameworks": ["fw1", "fw2"],
  "careerLevel": "Junior|Mid|Senior|Staff",
  "careerReason": "one line reason",
  "score": 7
}`,

  improvements: (summary) => `
You are a code quality expert. Analyze this GitHub profile and return ONLY a JSON object.

GitHub Summary: ${JSON.stringify(summary)}

Return this exact JSON structure (no markdown, no extra text):
{
  "missing": ["missing skill 1", "missing skill 2", "missing skill 3"],
  "improvements": ["improvement 1", "improvement 2", "improvement 3"],
  "strengths": ["strength 1", "strength 2", "strength 3"]
}`,

  roadmap: (summary) => `You are a career coach. Analyze this GitHub profile and return ONLY valid JSON, no markdown, no explanation.

GitHub Summary: ${JSON.stringify(summary)}

Return exactly this JSON:
{"shortTerm":["action1","action2","action3"],"longTerm":["goal1","goal2"],"topSkillToLearn":"skill","recommendedProjects":["idea1","idea2"]}`,

  hiringScore: (summary) => `
You are a hiring manager. Analyze this GitHub profile and return ONLY a JSON object.

GitHub Summary: ${JSON.stringify(summary)}

Return this exact JSON structure (no markdown, no extra text):
{
  "score": 7,
  "outOf": 10,
  "verdict": "one line hiring verdict",
  "positives": ["positive 1", "positive 2"],
  "concerns": ["concern 1", "concern 2"]
}`,
};

const safeCall = async (model, prompt, fallback) => {
  try {
    const text = await callModel(model, prompt);
    const jsonMatch = text.match(/\{[\s\S]*\}/);
    if (!jsonMatch) {
      console.warn(`⚠️ ${model} no JSON found in response: ${text.slice(0, 200)}`);
      return fallback;
    }
    return JSON.parse(jsonMatch[0]);
  } catch (e) {
    console.warn(`⚠️ ${model} failed: ${e.message}`);
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
    safeCall("meta/llama-3.1-70b-instruct", prompts.improvements(summary), {}),
    safeCall("nvidia/llama-3.3-nemotron-super-49b-v1", prompts.roadmap(summary), {}),
    safeCall("meta/llama-3.1-8b-instruct", prompts.hiringScore(summary), {}),
  ]);

  console.log("✅ Parallel AI analysis complete");

  return { technicalSkills, improvements, roadmap, hiringScore };
};
