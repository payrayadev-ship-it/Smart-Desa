import express from "express";
import path from "path";
import { createServer as createViteServer } from "vite";
import { GoogleGenAI } from "@google/genai";
import dotenv from "dotenv";

dotenv.config();

// Initialize Gemini Client
const apiKey = process.env.GEMINI_API_KEY;
let ai: GoogleGenAI | null = null;

if (apiKey && apiKey !== "MY_GEMINI_API_KEY") {
  try {
    ai = new GoogleGenAI({
      apiKey: apiKey,
      httpOptions: {
        headers: {
          'User-Agent': 'aistudio-build',
        }
      }
    });
  } catch (err) {
    console.error("Gagal menginisialisasi GoogleGenAI SDK:", err);
  }
}

async function startServer() {
  const app = express();
  const PORT = 3000;

  app.use(express.json({ limit: "15mb" }));

  // API Route: Check Health
  app.get("/api/health", (req, res) => {
    res.json({ status: "ok", aiEnabled: !!ai });
  });

  // API Route: AI Chat and smart village advice
  app.post("/api/ai/chat", async (req, res) => {
    const { messages, systemInstruction } = req.body;

    if (!ai) {
      return res.status(503).json({
        error: "Fitur AI belum dapat digunakan karena GEMINI_API_KEY belum dikonfigurasi di secrets panel."
      });
    }

    try {
      // Build a simple list of chat elements for generateContent
      // If we have messages history, translate to string context or query
      const prompt = messages[messages.length - 1]?.content || "Halo";
      
      const response = await ai.models.generateContent({
        model: "gemini-3.5-flash",
        contents: prompt,
        config: {
          systemInstruction: systemInstruction || "Anda adalah asisten AI pintar dari sistem pemerintahan desa Smart Desa Digital bernama 'SukaAsisten'. Anda bertugas melayani masyarakat desa Sukamaju dengan bahasa Indonesia yang ramah, sopan, formal dan solutif.",
          temperature: 0.7,
        }
      });

      res.json({ text: response.text });
    } catch (error: any) {
      console.error("Error calling Gemini API:", error);
      res.status(500).json({ error: error.message || "Gagal menghubungi AI Server." });
    }
  });

  // API Route: APBDes Keuangan Predictions and Advice
  app.post("/api/ai/budget-predict", async (req, res) => {
    const { currentFinance, villageGoals } = req.body;

    if (!ai) {
      return res.status(503).json({
        error: "Analisis anggaran AI belum aktif karena konfigurasi API key belum lengkap."
      });
    }

    const systemPrompt = `Anda adalah ahli kebijakan publik, perencana kota/desa, dan penasihat keuangan untuk APBDes (Anggaran Pendapatan dan Belanja Desa) di Indonesia. Berikan peninjauan anggaran, prakiraan kependudukan, serta 3 poin rekomendasi strategis alokasi dana secara efisien berdasarkan data keuangan desa yang diberikan dalam format Indonesia yang sangat rapi.`;
    const prompt = `Analisis data transaksi desa saat ini:\n${JSON.stringify(currentFinance)}\nTujuan desa jangka pendek:\n${villageGoals || "Meningkatkan ketahanan pangan dan UMKM desa."}\nBerikan laporan singkat, analisis rasio pengeluaran terhadap pemasukan dan buat proyeksi atau saran pengeluaran mendesak dengan ramah.`;

    try {
      const response = await ai.models.generateContent({
        model: "gemini-3.5-flash",
        contents: prompt,
        config: {
          systemInstruction: systemPrompt,
          temperature: 0.2,
        }
      });

      res.json({ text: response.text });
    } catch (error: any) {
      console.error("Error calling Gemini API:", error);
      res.status(500).json({ error: error.message });
    }
  });

  // API Route: AI Auto-draft response to Citizens' complaints
  app.post("/api/ai/complaint-draft", async (req, res) => {
    const { complaintTitle, complaintCategory, complaintDesc } = req.body;

    if (!ai) {
      return res.status(503).json({
        error: "Fitur AI draft pengaduan belum aktif."
      });
    }

    const systemPrompt = `Anda adalah Sekretaris Desa Sukamaju yang ramah, solutif, penengah, dan berorientasi pada pelayanan prima. Tulis draf tangapan surat resmi berwenang, santun, dan menenangkan warga terkait pengaduan mereka. Tetapkan tindakan mitigasi desa yang masuk akal.`;
    const prompt = `Kategori Pengaduan: ${complaintCategory}\nJudul: ${complaintTitle}\nDeskripsi Masalah: ${complaintDesc}\n\nTolong buatkan rancangan balasan yang menyejukkan hati dan berikan solusi rencana aksi desa konkret. Gunakan format surat tanggapan formal.`;

    try {
      const response = await ai.models.generateContent({
        model: "gemini-3.5-flash",
        contents: prompt,
        config: {
          systemInstruction: systemPrompt,
          temperature: 0.7,
        }
      });

      res.json({ text: response.text });
    } catch (error: any) {
      console.error("Error calling Gemini API:", error);
      res.status(500).json({ error: error.message });
    }
  });

  // Vite middleware setup
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Smart Desa Digital Server running on http://0.0.0.0:${PORT}`);
  });
}

startServer().catch((err) => {
  console.error("Failed to start server:", err);
});
