import express from "express";
import path from "path";
import { createServer as createViteServer } from "vite";
import { GoogleGenAI } from "@google/genai";

async function startServer() {
  const app = express();
  const PORT = 3000;

  app.use(express.json());

  // AI Explain Endpoint using @google/genai (Gemini 3.6 Flash)
  app.post("/api/ai/explain", async (req, res) => {
    try {
      const { topic, simulationState, prompt, mode, apiKey: customKey } = req.body;

      const apiKey = customKey || process.env.GEMINI_API_KEY;
      if (!apiKey) {
        return res.status(400).json({
          error: "GEMINI_API_KEY is not set. Please configure your API Key in Settings or set process.env.GEMINI_API_KEY."
        });
      }

      const ai = new GoogleGenAI({
        apiKey,
        httpOptions: {
          headers: {
            'User-Agent': 'aistudio-build'
          }
        }
      });

      const systemInstruction = `You are "JEE Mentor AI", a world-class senior IIT-JEE Physics educator and graphics scientist for JEE Main & Advanced.
Your job is to provide deep, intuitive, and mathematically rigorous physical explanations based on live simulation data.

Guidelines:
1. DO NOT perform heavy raw computations yourself; trust the physics engine data provided in the prompt.
2. Focus on conceptual intuition, physical mechanisms, symmetry arguments, and JEE Exam tips (e.g., standard JEE traps, vector additions, potential surfaces).
3. If mode is "socratic" or "challenge", do NOT give direct answers immediately. Ask guiding questions to help the student discover the answer through experimentation.
4. Use clean LaTeX notation (e.g. $F = \\frac{1}{4\\pi\\varepsilon_0} \\frac{q_1 q_2}{r^2}$) when explaining equations.
5. Keep responses concise, well-structured with bullet points, and highly engaging.`;

      const userContent = `Topic: ${topic || "General JEE Physics"}
Mode: ${mode || "explore"}
Current Live Simulation Parameters:
${JSON.stringify(simulationState, null, 2)}

Student Question/Context:
${prompt || "Explain the underlying physics happening right now in this simulation."}`;

      const response = await ai.models.generateContent({
        model: "gemini-3.6-flash",
        contents: userContent,
        config: {
          systemInstruction,
          temperature: 0.7,
        }
      });

      res.json({
        text: response.text || "No explanation generated."
      });
    } catch (err: any) {
      console.error("Error in /api/ai/explain:", err);
      res.status(500).json({
        error: err.message || "Failed to generate AI physics explanation."
      });
    }
  });

  // Health check endpoint
  app.get("/api/health", (_req, res) => {
    res.json({ status: "ok", app: "JEE Sandbox Server" });
  });

  // Vite middleware for development vs static production serving
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (_req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`JEE Sandbox running on http://0.0.0.0:${PORT}`);
  });
}

startServer();
