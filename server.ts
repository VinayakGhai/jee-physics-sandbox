import express from "express";
import path from "path";
import fs from "fs";
import { createServer as createViteServer } from "vite";
import { GoogleGenAI } from "@google/genai";

const ANALYTICS_FILE = path.join(process.cwd(), "analytics.json");
const ADMIN_TOKEN = "JEEAnalyticsSecure2026";

interface SessionData {
  id: string;
  firstSeen: string;
  lastPing: string;
  pings: number;
  presets: string[];
  userAgent?: string;
}

// Thread-safe helper to load analytics
function loadAnalytics(): Record<string, SessionData> {
  if (!fs.existsSync(ANALYTICS_FILE)) return {};
  try {
    return JSON.parse(fs.readFileSync(ANALYTICS_FILE, "utf-8"));
  } catch {
    return {};
  }
}

// Thread-safe helper to save analytics
function saveAnalytics(data: Record<string, SessionData>) {
  try {
    fs.writeFileSync(ANALYTICS_FILE, JSON.stringify(data, null, 2));
  } catch (err) {
    console.error("Failed to write analytics file:", err);
  }
}

async function startServer() {
  const app = express();
  const PORT = Number(process.env.PORT) || 3000;

  app.use(express.json());

  // ── 1. Telemetry Ping Endpoint ──────────────────────────────────────────
  app.post("/api/analytics/ping", (req, res) => {
    try {
      const { sessionId, presetId } = req.body;
      if (!sessionId) {
        return res.status(400).json({ error: "sessionId is required" });
      }

      const data = loadAnalytics();
      const now = new Date().toISOString();
      const userAgent = req.headers["user-agent"];

      if (!data[sessionId]) {
        data[sessionId] = {
          id: sessionId,
          firstSeen: now,
          lastPing: now,
          pings: 1,
          presets: presetId ? [presetId] : [],
          userAgent,
        };
      } else {
        data[sessionId].lastPing = now;
        data[sessionId].pings += 1;
        if (presetId && !data[sessionId].presets.includes(presetId)) {
          data[sessionId].presets.push(presetId);
        }
      }

      saveAnalytics(data);
      res.json({ success: true });
    } catch (err) {
      console.error("Analytics ping error:", err);
      res.status(500).json({ error: "Internal tracking error" });
    }
  });

  // ── 2. Admin Analytics Dashboard ─────────────────────────────────────────
  app.get("/api/admin/analytics", (req, res) => {
    const { token } = req.query;
    if (token !== ADMIN_TOKEN) {
      return res.status(403).send("<h1>403 Forbidden: Invalid Analytics Token</h1>");
    }

    try {
      const data = loadAnalytics();
      const sessions = Object.values(data);
      const now = Date.now();

      // Active users (pinged in the last 5 minutes)
      const activeSessions = sessions.filter((s) => {
        const diffMs = now - new Date(s.lastPing).getTime();
        return diffMs < 5 * 60 * 1000; // 5 minutes
      });

      // Calculate preset popularities
      const presetCounts: Record<string, number> = {};
      sessions.forEach((s) => {
        s.presets.forEach((p) => {
          presetCounts[p] = (presetCounts[p] || 0) + 1;
        });
      });

      // HTML template for the analytics console
      const html = `
      <!DOCTYPE html>
      <html lang="en">
      <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>JEE Physics Studio - Admin Telemetry Console</title>
        <link href="https://fonts.googleapis.com/css2?family=Outfit:wght@300;400;600;700&display=swap" rel="stylesheet">
        <style>
          body {
            background-color: #020617;
            color: #f1f5f9;
            font-family: 'Outfit', sans-serif;
            margin: 0;
            padding: 24px;
          }
          .container {
            max-width: 1200px;
            margin: 0 auto;
          }
          header {
            display: flex;
            justify-content: space-between;
            align-items: center;
            border-bottom: 1px solid #1e293b;
            padding-bottom: 16px;
            margin-bottom: 24px;
          }
          h1 {
            font-size: 28px;
            font-weight: 700;
            margin: 0;
            background: linear-gradient(135deg, #a78bfa 0%, #38bdf8 100%);
            -webkit-background-clip: text;
            -webkit-text-fill-color: transparent;
          }
          .grid {
            display: grid;
            grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
            gap: 20px;
            margin-bottom: 32px;
          }
          .card {
            background-color: #0f172a;
            border: 1px solid #1e293b;
            border-radius: 12px;
            padding: 20px;
            box-shadow: 0 4px 6px -1px rgb(0 0 0 / 0.1);
          }
          .card h3 {
            margin: 0 0 8px 0;
            color: #94a3b8;
            font-size: 14px;
            text-transform: uppercase;
            letter-spacing: 0.05em;
          }
          .card .value {
            font-size: 36px;
            font-weight: 700;
            color: #38bdf8;
          }
          .preset-list {
            margin-top: 10px;
          }
          .preset-item {
            display: flex;
            justify-content: space-between;
            padding: 6px 0;
            border-bottom: 1px solid #1e293b;
            font-size: 14px;
          }
          table {
            width: 100%;
            border-collapse: collapse;
            margin-top: 12px;
            font-size: 14px;
          }
          th, td {
            text-align: left;
            padding: 12px;
            border-bottom: 1px solid #1e293b;
          }
          th {
            background-color: #0f172a;
            color: #94a3b8;
            font-weight: 600;
          }
          tr:hover td {
            background-color: #0f172a;
          }
          .badge {
            background-color: #10b981;
            color: #020617;
            padding: 2px 8px;
            border-radius: 9999px;
            font-weight: 600;
            font-size: 12px;
          }
          .badge-inactive {
            background-color: #ef4444;
            color: #ffffff;
          }
          .btn-refresh {
            background: linear-gradient(135deg, #a78bfa 0%, #38bdf8 100%);
            color: #020617;
            border: none;
            padding: 8px 16px;
            border-radius: 8px;
            font-weight: 600;
            cursor: pointer;
            text-decoration: none;
          }
        </style>
      </head>
      <body>
        <div class="container">
          <header>
            <div>
              <h1>JEE Physics Sandbox — Admin Telemetry Console</h1>
              <p style="color: #94a3b8; margin: 4px 0 0 0;">Live tracking of active user sessions</p>
            </div>
            <a href="?token=${ADMIN_TOKEN}" class="btn-refresh">Refresh Page</a>
          </header>

          <div class="grid">
            <div class="card">
              <h3>Active Users (Last 5 mins)</h3>
              <div class="value">${activeSessions.length}</div>
            </div>
            <div class="card">
              <h3>Total Unique Visitors</h3>
              <div class="value">${sessions.length}</div>
            </div>
            <div class="card">
              <h3>Top Active Presets</h3>
              <div class="preset-list">
                ${Object.entries(presetCounts)
                  .sort((a, b) => b[1] - a[1])
                  .slice(0, 5)
                  .map(([pId, count]) => `
                    <div class="preset-item">
                      <span style="font-weight: 600; color: #cbd5e1;">${pId}</span>
                      <span style="color: #38bdf8;">${count} hits</span>
                    </div>
                  `).join("") || '<p style="color:#64748b; margin:0;">No hits recorded yet.</p>'}
              </div>
            </div>
          </div>

          <div class="card" style="overflow-x: auto;">
            <h3 style="margin-bottom: 16px;">Active Sessions Log</h3>
            <table>
              <thead>
                <tr>
                  <th>Session ID</th>
                  <th>Status</th>
                  <th>First Seen</th>
                  <th>Last Ping</th>
                  <th>Pings Count</th>
                  <th>Presets Explored</th>
                  <th>User Agent</th>
                </tr>
              </thead>
              <tbody>
                ${sessions.map((s) => {
                  const isActive = (now - new Date(s.lastPing).getTime()) < 5 * 60 * 1000;
                  return `
                  <tr>
                    <td style="font-family: monospace; color: #94a3b8;">${s.id}</td>
                    <td>
                      <span class="badge ${isActive ? '' : 'badge-inactive'}">
                        ${isActive ? 'Active' : 'Offline'}
                      </span>
                    </td>
                    <td>${new Date(s.firstSeen).toLocaleString()}</td>
                    <td>${new Date(s.lastPing).toLocaleString()}</td>
                    <td>${s.pings}</td>
                    <td><span style="color: #38bdf8;">${s.presets.join(", ") || "-"}</span></td>
                    <td style="max-width: 200px; overflow: hidden; text-overflow: ellipsis; white-space: nowrap;" title="${s.userAgent || ''}">
                      ${s.userAgent || 'Unknown'}
                    </td>
                  </tr>
                  `;
                }).join("")}
              </tbody>
            </table>
          </div>
        </div>
      </body>
      </html>
      `;

      res.send(html);
    } catch (err: any) {
      res.status(500).send(`<h1>Error generating report</h1><p>${err.message}</p>`);
    }
  });

  // ── 3. AI Explain Endpoint ──────────────────────────────────────────────
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
