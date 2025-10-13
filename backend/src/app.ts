/**
 * Expressアプリの設定
 * - CORS / JSONパース設定
 * - ルート登録
 */

import express from "express";
import cors from "cors";
import openaiRouter from "./routes/openai";
import suggestionsRouter from "./routes/suggestions";

const app = express();

// ========= ミドルウェア =========
app.use(cors());
app.use(express.json());

// ========= ヘルスチェック =========
app.get("/", (_req, res) => {
  res.json({ message: "✅ API server is running" });
});

// ========= ルート登録 =========
app.use("/api/openai", openaiRouter);
app.use("/api/suggestions", suggestionsRouter);

// ========= エラーハンドリング =========
app.use((err: any, _req: express.Request, res: express.Response, _next: express.NextFunction) => {
  console.error("🔥 Error:", err);
  res.status(err.status || 500).json({
    error: {
      message: err.message || "Internal Server Error",
      stack: process.env.NODE_ENV === "development" ? err.stack : undefined,
    },
  });
});

export default app;