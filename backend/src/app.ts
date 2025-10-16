/**
 * Expressアプリの設定
 * - CORS / JSONパース設定
 * - 全ての JSON レスポンスに charset=utf-8 を付与（文字化け対策）
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

// ★ JSONレスポンスは常に UTF-8 を明示
app.use((_req, res, next) => {
  const originalJson = res.json.bind(res);
  res.json = (body: any) => {
    res.setHeader("Content-Type", "application/json; charset=utf-8");
    return originalJson(body);
  };
  next();
});

// （任意）ルート別の簡易アクセスログ
app.use((req, _res, next) => {
  if (req.path.startsWith("/api/openai") || req.path.startsWith("/api/suggestions")) {
    console.log(`[API] ${req.method} ${req.path}`);
  }
  next();
});

// ========= ヘルスチェック =========
app.get("/", (_req, res) => {
  res.json({ ok: true, message: "✅ API server is running" });
});

// ========= ルート登録 =========
app.use("/api/openai", openaiRouter);
app.use("/api/suggestions", suggestionsRouter);

// ========= エラーハンドリング =========
app.use(
  (err: any, _req: express.Request, res: express.Response, _next: express.NextFunction) => {
    console.error("🔥 Error:", err);
    res.status(err.status || 500).json({
      error: {
        message: err.message || "Internal Server Error",
        stack: process.env.NODE_ENV === "development" ? err.stack : undefined,
      },
    });
  }
);

export default app;