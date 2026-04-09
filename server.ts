import express from "express";
import { createServer as createViteServer } from "vite";
import path from "path";
import cors from "cors";
import fs from "fs";
import { transcribeAudio } from "./server/geminiService.js";
import { saveAudio, getAudioPath, deleteAudio } from "./server/audioService.js";

async function startServer() {
  const app = express();
  const PORT = 3000;

  app.use(cors());
  app.use(express.json({ limit: '50mb' }));

  // API routes FIRST
  app.get("/api/health", (req, res) => {
    res.json({ 
      status: "ok", 
      keyLength: process.env.GEMINI_API_KEY?.length,
      keyStart: process.env.GEMINI_API_KEY?.substring(0, 4),
      envKeys: Object.keys(process.env).filter(k => k.includes('GEMINI'))
    });
  });

  app.post("/api/audio", (req, res) => {
    try {
      const { base64Audio, mimeType } = req.body;
      if (!base64Audio || !mimeType) {
        return res.status(400).json({ error: "Missing audio data or mimeType" });
      }
      const result = saveAudio(base64Audio, mimeType);
      res.json(result);
    } catch (error: any) {
      console.error("Error saving audio:", error);
      res.status(500).json({ error: error.message || "Internal server error" });
    }
  });

  app.get("/api/audio/:filename", (req, res) => {
    const filePath = getAudioPath(req.params.filename);
    if (fs.existsSync(filePath)) {
      res.sendFile(filePath);
    } else {
      res.status(404).send("Audio not found");
    }
  });

  app.delete("/api/audio/:filename", (req, res) => {
    try {
      deleteAudio(req.params.filename);
      res.json({ success: true });
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  app.post("/api/transcribe", async (req, res) => {
    try {
      const { audioFilename, mimeType, callCenter } = req.body;
      
      if (!audioFilename || !mimeType) {
        return res.status(400).json({ error: "Missing audioFilename or mimeType" });
      }

      const filePath = getAudioPath(audioFilename);
      if (!fs.existsSync(filePath)) {
        return res.status(404).json({ error: "Audio file not found" });
      }

      const base64Audio = fs.readFileSync(filePath, { encoding: 'base64' });
      const result = await transcribeAudio(base64Audio, mimeType, callCenter || "Neutral (Sin asignar)");
      res.json(result);
    } catch (error: any) {
      console.error("Error in /api/transcribe:", error);
      res.status(500).json({ error: error.message || "Internal server error" });
    }
  });

  // Vite middleware for development
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*all', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

startServer();
