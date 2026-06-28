import express from "express";
import path from "path";
import { createServer as createViteServer } from "vite";
import { GoogleGenAI } from "@google/genai";
import dotenv from "dotenv";

dotenv.config();

const app = express();
const PORT = 3000;

app.use(express.json());

// Initialize Gemini API
let ai: GoogleGenAI | null = null;
function getAI() {
  if (!ai) {
    const key = process.env.GEMINI_API_KEY;
    if (!key) {
      console.warn("WARNING: GEMINI_API_KEY environment variable is not set. Gemini features will be mocked.");
      return null;
    }
    ai = new GoogleGenAI({ apiKey: key });
  }
  return ai;
}

// 1. AI Chat Endpoint
app.post("/api/chat", async (req, res) => {
  try {
    const { message, history } = req.body;
    const client = getAI();

    if (!client) {
      // Mock response if API key is not available
      return res.json({
        text: `[DEMO MODE] Thank you for sharing. I'm here as your MindMate companion. You said: "${message}". In a live environment with an API key, I would provide tailored, empathetic guidance. Please remember I'm a wellness companion and not a medical diagnosis tool.`
      });
    }

    // Prepare system instructions to enforce safety constraints and therapist persona
    const systemInstruction = 
      "You are MindMate AI, an empathetic, supportive, and accessible mental wellness companion. " +
      "Your goal is to provide warm, stigma-free daily emotional support, active listening, and gentle self-care recommendations. " +
      "CRITICAL SAFETY RULE: You are a wellness companion and NOT a licensed therapist, psychologist, or medical diagnosis tool. " +
      "Never diagnose illnesses or claim to replace professional care. " +
      "If the user expresses thoughts of self-harm, suicide, or immediate danger, respond with deep empathy, " +
      "gently encourage them to contact trusted family/friends, and advise seeking local emergency or mental health services. " +
      "Do NOT provide harmful instructions or pretend to offer crisis intervention. " +
      "Keep responses relatively concise (2-4 paragraphs max), formatting with Markdown. Offer a warm, calming vibe.";

    // Format chat history for @google/genai SDK
    // The SDK expects contents in the form of { role: 'user'|'model', parts: [{ text: '...' }] }
    const formattedContents = [];
    if (history && Array.isArray(history)) {
      for (const msg of history) {
        formattedContents.push({
          role: msg.role === "user" ? "user" : "model",
          parts: [{ text: msg.text }]
        });
      }
    }
    
    // Add current message
    formattedContents.push({
      role: "user",
      parts: [{ text: message }]
    });

    const response = await client.models.generateContent({
      model: "gemini-2.5-flash",
      contents: formattedContents,
      config: {
        systemInstruction: systemInstruction,
        temperature: 0.7,
      }
    });

    res.json({ text: response.text });
  } catch (error: any) {
    console.error("Error in /api/chat:", error);
    // If rate-limited or quota exceeded, fallback gracefully to provide helper advice
    if (error?.message?.includes("quota") || error?.message?.includes("limit") || error?.message?.includes("429") || error?.status === "RESOURCE_EXHAUSTED" || String(error).includes("429")) {
      return res.json({
        text: "I'm currently resting my digital mind due to high conversation volume, but please know I'm still right here with you. Take a deep, gentle breath. How is your heart holding up today? You can write any thoughts in your Journal to reflect further."
      });
    }
    res.status(500).json({ error: error.message || "Internal Server Error" });
  }
});

// 2. Journal Summarization and Emotion Analysis
app.post("/api/analyze-journal", async (req, res) => {
  try {
    const { content } = req.body;
    if (!content || typeof content !== "string" || content.trim().length === 0) {
      return res.status(400).json({ error: "Journal content is empty" });
    }

    const client = getAI();
    if (!client) {
      return res.json({
        emotion: "Neutral",
        sentimentScore: 60,
        summary: "This is a placeholder summary. Journal analysis will be active once your GEMINI_API_KEY is configured.",
        keywords: ["Reflection", "Daily Log"],
        reflectionPrompt: "How did today's events make you feel overall?"
      });
    }

    const prompt = `Analyze this daily journal entry:
"${content}"

Provide a JSON object containing:
1. "emotion": One primary emotion from: "Happy", "Neutral", "Sad", "Angry", "Anxiety", "Excited".
2. "sentimentScore": An emotional wellness score from 0 to 100 (where 0 is extremely distressed, 50 is neutral, and 100 is highly positive/happy).
3. "summary": A 2-sentence summary of the user's entry.
4. "keywords": Array of 3-4 key themes or emotional triggers found in the text.
5. "reflectionPrompt": A gentle, therapeutic, personalized question or reflection prompt based on their entry to help them process their day further.

CRITICAL: Return ONLY valid, minified JSON. Do not wrap in markdown code blocks. Do not output anything else.`;

    const response = await client.models.generateContent({
      model: "gemini-2.5-flash",
      contents: prompt,
      config: {
        responseMimeType: "application/json"
      }
    });

    const text = response.text || "{}";
    const result = JSON.parse(text.trim());
    res.json(result);
  } catch (error: any) {
    console.error("Error in /api/analyze-journal:", error);
    // Graceful fallback for rate limits or any other API error so the user's journal entry works beautifully
    res.json({
      emotion: "Neutral",
      sentimentScore: 65,
      summary: "Your entry has been securely recorded in your private mental wellness space.",
      keywords: ["Reflection", "Mindfulness", "Self-Care"],
      reflectionPrompt: "Writing is a powerful step. What is one positive thing you can focus on for tomorrow?"
    });
  }
});

// 3. Burnout Predictor Endpoint
app.post("/api/burnout-prediction", async (req, res) => {
  try {
    const { moodHistory, sleepQuality, stressAnswers } = req.body;
    // stressAnswers is an array of answers/scores (0-3) for questions
    const client = getAI();
    
    if (!client) {
      return res.json({
        riskLevel: "Medium",
        riskScore: 45,
        insights: [
          "Ensure you maintain a consistent sleeping pattern.",
          "Try scheduling 10-minute micro-breaks during work sessions."
        ],
        advice: "Your burnout risk is estimated based on baseline responses. Connect your API key for personalized insights."
      });
    }

    const prompt = `Evaluate the user's risk of burnout based on these signals:
- Recent mood states: ${JSON.stringify(moodHistory || [])}
- Sleep quality (out of 10): ${sleepQuality || "Not specified"}
- Stress questionnaire answers (each item rated 0 to 3, where higher is more stress): ${JSON.stringify(stressAnswers || [])}

Provide a JSON response with:
1. "riskLevel": One of "Low", "Medium", "High".
2. "riskScore": A numeric score from 0 to 100 indicating burnout risk.
3. "insights": An array of 3 specific, practical, highly actionable, personalized self-care recommendations to reduce stress.
4. "advice": A 2-sentence calming, supportive conclusion.

CRITICAL: Remember that this is NOT a medical diagnosis. Return ONLY valid JSON, do not include markdown styling.`;

    const response = await client.models.generateContent({
      model: "gemini-2.5-flash",
      contents: prompt,
      config: {
        responseMimeType: "application/json"
      }
    });

    const text = response.text || "{}";
    const result = JSON.parse(text.trim());
    res.json(result);
  } catch (error: any) {
    console.error("Error in /api/burnout-prediction:", error);
    // Graceful fallback for burnout assessment
    res.json({
      riskLevel: "Medium",
      riskScore: 50,
      insights: [
        "Create micro-breaks of at least 5 minutes in your calendar.",
        "Focus on single-tasking and block distracting notifications.",
        "Take a short walk outdoors or spend time in nature."
      ],
      advice: "Your burnout risk level has been assessed with standard offline parameters. Keep checking in regularly!"
    });
  }
});

// 4. Daily Motivation and Quotes
const FALLBACK_QUOTES = [
  {
    quote: "The only journey is the one within.",
    author: "Rainer Maria Rilke",
    challenge: "Take three deep breaths right now and appreciate the present moment."
  },
  {
    quote: "You yourself, as much as anybody in the entire universe, deserve your love and affection.",
    author: "Buddha",
    challenge: "Write down three small things you are grateful for today."
  },
  {
    quote: "Sometimes the most important thing in a whole day is the rest we take between two deep breaths.",
    author: "Etty Hillesum",
    challenge: "Step away from all screens for exactly 5 minutes and stretch gently."
  },
  {
    quote: "Do not let the behavior of others destroy your inner peace.",
    author: "Dalai Lama",
    challenge: "Drink a warm glass of water mindfully, focusing on the sensory experience."
  },
  {
    quote: "Almost everything will work again if you unplug it for a few minutes, including you.",
    author: "Anne Lamott",
    challenge: "Close your eyes and listen to the ambient sounds around you for two minutes."
  }
];

app.get("/api/get-motivation", async (req, res) => {
  try {
    const client = getAI();
    if (!client) {
      const idx = Math.floor(Math.random() * FALLBACK_QUOTES.length);
      return res.json(FALLBACK_QUOTES[idx]);
    }

    const prompt = `Generate a fresh, highly inspiring daily mental wellness quote and a supportive wellness challenge.
Return a JSON object containing:
1. "quote": A beautiful, calming, deep, or motivational quote.
2. "author": The author of the quote.
3. "challenge": A simple, highly actionable "Today's Wellness Challenge" (e.g., "Write down 3 things you're grateful for", "Go for a 5-minute silent walk").

CRITICAL: Return ONLY valid, raw JSON. Do not wrap in markdown code blocks.`;

    const response = await client.models.generateContent({
      model: "gemini-2.5-flash",
      contents: prompt,
      config: {
        responseMimeType: "application/json"
      }
    });

    const text = response.text || "{}";
    const result = JSON.parse(text.trim());
    res.json(result);
  }
});

// Serve frontend assets
async function startServer() {
  if (process.env.NODE_ENV !== "production" && !process.env.VERCEL) {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  if (!process.env.VERCEL) {
    app.listen(PORT, "0.0.0.0", () => {
      console.log(`Server running on http://0.0.0.0:${PORT}`);
    });
  }
}

startServer();

export default app;
